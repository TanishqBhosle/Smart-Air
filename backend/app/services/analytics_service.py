"""Analytics service for aggregating and querying historical air quality data.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from pathlib import Path
from model.training.config import AQI_CATEGORIES, ALL_POLLUTANTS
from backend.app.core.config import settings


class AnalyticsService:
    _instance = None

    def __init__(self):
        self.data: Optional[pd.DataFrame] = None
        self.stations_info: Optional[pd.DataFrame] = None
        self.load_data()

    @classmethod
    def get_instance(cls) -> "AnalyticsService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_data(self):
        """Load and cache cleaned dataset and stations reference data."""
        if settings.DATA_PATH.exists():
            df = pd.read_csv(str(settings.DATA_PATH))
            df.columns = df.columns.str.strip()
            df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
            df["AQI"] = pd.to_numeric(df["AQI"], errors="coerce")
            for col in ALL_POLLUTANTS:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce")
            
            # Clean and filter
            df = df.dropna(subset=["StationId", "Date", "AQI"])
            df = df[df["AQI"] >= 0]
            df = df.drop_duplicates(["StationId", "Date"], keep="first")
            df = df.sort_values(["StationId", "Date"]).reset_index(drop=True)
            self.data = df

        if settings.STATIONS_PATH.exists():
            st_df = pd.read_csv(str(settings.STATIONS_PATH))
            st_df.columns = st_df.columns.str.strip()
            self.stations_info = st_df.set_index("StationId") if "StationId" in st_df.columns else None

    @staticmethod
    def get_aqi_category_info(aqi: float) -> Dict[str, Any]:
        """Classify AQI and return label, color, description."""
        for band in AQI_CATEGORIES:
            if band["min"] <= aqi <= band["max"]:
                return band
        if aqi < 0:
            return {"category": "Invalid", "color": "#6B7280", "description": "Invalid reading"}
        return {"category": "Severe+", "color": "#581C87", "description": "Hazardous extreme pollution"}

    def get_station_name(self, station_id: str) -> Dict[str, str]:
        """Return station name, city, state from stations.csv if available."""
        if self.stations_info is not None and station_id in self.stations_info.index:
            row = self.stations_info.loc[station_id]
            return {
                "name": str(row.get("StationName", station_id)),
                "city": str(row.get("City", "India")),
                "state": str(row.get("State", "India")),
                "status": str(row.get("Status", "Active"))
            }
        return {"name": station_id, "city": "India", "state": "India", "status": "Active"}

    def get_all_stations(self) -> List[Dict[str, Any]]:
        """List all available stations with summary statistics."""
        if self.data is None or self.data.empty:
            return []

        station_groups = self.data.groupby("StationId")
        result = []

        for st_id, group in station_groups:
            meta = self.get_station_name(st_id)
            group_sorted = group.sort_values("Date")
            latest_row = group_sorted.iloc[-1]
            latest_aqi = float(latest_row["AQI"])
            cat_info = self.get_aqi_category_info(latest_aqi)

            result.append({
                "station_id": st_id,
                "station_name": meta["name"],
                "city": meta["city"],
                "state": meta["state"],
                "status": meta["status"],
                "total_records": len(group),
                "first_date": str(group_sorted["Date"].iloc[0].date()),
                "last_date": str(latest_row["Date"].date()),
                "average_aqi": round(float(group["AQI"].mean()), 1),
                "latest_aqi": round(latest_aqi, 1),
                "latest_category": cat_info["category"],
                "latest_category_color": cat_info["color"]
            })

        # Sort by total records descending
        result.sort(key=lambda x: x["total_records"], reverse=True)
        return result

    def get_station_detail(self, station_id: str) -> Optional[Dict[str, Any]]:
        """Detailed metadata and stats for a single station."""
        if self.data is None or self.data.empty:
            return None

        st_data = self.data[self.data["StationId"] == station_id].sort_values("Date")
        if st_data.empty:
            return None

        meta = self.get_station_name(station_id)
        latest_aqi = float(st_data["AQI"].iloc[-1])
        cat_info = self.get_aqi_category_info(latest_aqi)

        available_pollutants = [
            c for c in ALL_POLLUTANTS
            if c in st_data.columns and st_data[c].notna().sum() > 0
        ]

        valid_dates = self.get_valid_prediction_dates(station_id)

        return {
            "station_id": station_id,
            "station_name": meta["name"],
            "city": meta["city"],
            "state": meta["state"],
            "status": meta["status"],
            "total_records": len(st_data),
            "first_date": str(st_data["Date"].iloc[0].date()),
            "last_date": str(st_data["Date"].iloc[-1].date()),
            "average_aqi": round(float(st_data["AQI"].mean()), 1),
            "latest_aqi": round(latest_aqi, 1),
            "latest_category": cat_info["category"],
            "latest_category_color": cat_info["color"],
            "available_pollutants": available_pollutants,
            "missing_aqi_days": 0,
            "valid_prediction_dates_count": len(valid_dates)
        }

    def get_dashboard_summary(self, station_id: Optional[str] = None) -> Dict[str, Any]:
        """Aggregated summary KPI metrics for dashboard."""
        if self.data is None or self.data.empty:
            return {
                "station_id": None,
                "station_name": None,
                "latest_aqi": None,
                "previous_aqi": None,
                "aqi_change": None,
                "latest_date": None,
                "aqi_category": None,
                "category_color": None,
                "dominant_pollutant": None,
                "dominant_pollutant_value": None,
                "available_stations_count": 0,
                "total_records_count": 0,
                "dataset_date_range": {"start": "", "end": ""},
                "predicted_next_day_aqi": None,
                "predicted_aqi_category": None,
                "predicted_category_color": None
            }

        stations_count = self.data["StationId"].nunique()
        records_count = len(self.data)
        date_min = str(self.data["Date"].min().date())
        date_max = str(self.data["Date"].max().date())

        # If station not provided, pick station with most recent records (e.g., DL001 or top station)
        if not station_id:
            # Pick DL001 if available or first station with high coverage
            if "DL001" in self.data["StationId"].values:
                station_id = "DL001"
            else:
                station_id = self.data["StationId"].value_counts().index[0]

        st_data = self.data[self.data["StationId"] == station_id].sort_values("Date")
        meta = self.get_station_name(station_id)

        if st_data.empty:
            return {
                "station_id": station_id,
                "station_name": meta["name"],
                "latest_aqi": None,
                "previous_aqi": None,
                "aqi_change": None,
                "latest_date": None,
                "aqi_category": None,
                "category_color": None,
                "dominant_pollutant": None,
                "dominant_pollutant_value": None,
                "available_stations_count": stations_count,
                "total_records_count": records_count,
                "dataset_date_range": {"start": date_min, "end": date_max},
            }

        latest_row = st_data.iloc[-1]
        latest_aqi = float(latest_row["AQI"])
        latest_date = str(latest_row["Date"].date())
        prev_aqi = float(st_data.iloc[-2]["AQI"]) if len(st_data) > 1 else latest_aqi
        aqi_change = round(latest_aqi - prev_aqi, 1)

        cat_info = self.get_aqi_category_info(latest_aqi)

        # Identify dominant pollutant from latest row
        candidate_p = [c for c in ["PM2.5", "PM10", "NO2", "SO2", "CO", "O3"] if c in latest_row.index]
        dominant_p = None
        dominant_val = None
        if candidate_p:
            p_series = latest_row[candidate_p].dropna()
            if not p_series.empty:
                # Rank by relative severity (PM2.5 standard max ~60, PM10 ~100)
                # For simplicity, highest PM2.5 or PM10 or max ratio
                dominant_p = p_series.idxmax()
                dominant_val = round(float(p_series.max()), 1)

        return {
            "station_id": station_id,
            "station_name": meta["name"],
            "latest_aqi": round(latest_aqi, 1),
            "previous_aqi": round(prev_aqi, 1),
            "aqi_change": aqi_change,
            "latest_date": latest_date,
            "aqi_category": cat_info["category"],
            "category_color": cat_info["color"],
            "dominant_pollutant": dominant_p,
            "dominant_pollutant_value": dominant_val,
            "available_stations_count": stations_count,
            "total_records_count": records_count,
            "dataset_date_range": {"start": date_min, "end": date_max},
            "predicted_next_day_aqi": None,
            "predicted_aqi_category": None,
            "predicted_category_color": None
        }

    def get_aqi_trend(
        self,
        station_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 180
    ) -> List[Dict[str, Any]]:
        """Historical AQI trend series for line charting."""
        if self.data is None:
            return []

        df = self.data[self.data["StationId"] == station_id].sort_values("Date")
        if df.empty:
            return []

        if start_date:
            df = df[df["Date"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["Date"] <= pd.to_datetime(end_date)]

        if limit and len(df) > limit:
            df = df.tail(limit)

        result = []
        for _, row in df.iterrows():
            aqi_val = float(row["AQI"])
            cat = self.get_aqi_category_info(aqi_val)
            result.append({
                "date": str(row["Date"].date()),
                "aqi": round(aqi_val, 1),
                "category": cat["category"],
                "category_color": cat["color"]
            })
        return result

    def get_pollutants_trend(
        self,
        station_id: str,
        limit: int = 90
    ) -> List[Dict[str, Any]]:
        """Pollutant concentration trend series."""
        if self.data is None:
            return []

        df = self.data[self.data["StationId"] == station_id].sort_values("Date")
        if df.empty:
            return []

        if limit and len(df) > limit:
            df = df.tail(limit)

        result = []
        for _, row in df.iterrows():
            dp = {"date": str(row["Date"].date())}
            for col in ALL_POLLUTANTS:
                if col in row.index and pd.notna(row[col]):
                    dp[col.lower().replace(".", "")] = round(float(row[col]), 2)
                else:
                    dp[col.lower().replace(".", "")] = None
            result.append(dp)
        return result

    def get_category_distribution(self, station_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """AQI category breakdown distribution."""
        if self.data is None:
            return []

        df = self.data
        if station_id:
            df = df[df["StationId"] == station_id]

        total = len(df)
        if total == 0:
            return []

        counts = {cat["category"]: 0 for cat in AQI_CATEGORIES}
        for aqi_val in df["AQI"].dropna():
            cat = self.get_aqi_category_info(float(aqi_val))["category"]
            if cat in counts:
                counts[cat] += 1

        result = []
        for cat in AQI_CATEGORIES:
            name = cat["category"]
            c = counts.get(name, 0)
            result.append({
                "category": name,
                "count": c,
                "percentage": round(100.0 * c / total, 2),
                "color": cat["color"]
            })
        return result

    def get_station_comparisons(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Compare top stations by average AQI."""
        if self.data is None:
            return []

        grouped = self.data.groupby("StationId").agg(
            avg_aqi=("AQI", "mean"),
            max_aqi=("AQI", "max"),
            records=("AQI", "count")
        )
        grouped = grouped[grouped["records"] >= 30].sort_values("avg_aqi", ascending=False).head(limit)

        result = []
        for st_id, row in grouped.iterrows():
            meta = self.get_station_name(st_id)
            latest_row = self.data[self.data["StationId"] == st_id].sort_values("Date").iloc[-1]
            result.append({
                "station_id": st_id,
                "station_name": meta["name"],
                "city": meta["city"],
                "average_aqi": round(float(row["avg_aqi"]), 1),
                "max_aqi": round(float(row["max_aqi"]), 1),
                "latest_aqi": round(float(latest_row["AQI"]), 1),
                "record_count": int(row["records"])
            })
        return result

    def get_valid_prediction_dates(self, station_id: str) -> List[str]:
        """Find all calendar dates for a station where the preceding 7 consecutive days exist."""
        if self.data is None:
            return []

        st_data = self.data[self.data["StationId"] == station_id].sort_values("Date")
        if len(st_data) < 8:
            return []

        dates = pd.to_datetime(st_data["Date"].to_numpy())
        date_set = set(d.date() for d in dates)

        valid_prediction_dates = []
        for d in dates[7:]:
            target_date = d.date()
            preceding = [target_date - pd.Timedelta(days=i) for i in range(1, 8)]
            if all(p in date_set for p in preceding):
                valid_prediction_dates.append(str(target_date))

        return valid_prediction_dates

    def get_preceding_7_days(
        self,
        station_id: str,
        target_date_str: str
    ) -> List[Dict[str, Any]]:
        """Retrieve the exact 7 consecutive days preceding target_date_str for station_id."""
        if self.data is None:
            raise ValueError("Dataset not loaded.")

        target_date = pd.to_datetime(target_date_str).date()
        expected_dates = [target_date - pd.Timedelta(days=i) for i in range(7, 0, -1)]

        st_data = self.data[self.data["StationId"] == station_id].copy()
        st_data["DateOnly"] = st_data["Date"].dt.date

        found_rows = st_data[st_data["DateOnly"].isin(expected_dates)].sort_values("Date")

        if len(found_rows) != 7:
            found_dates = set(found_rows["DateOnly"])
            missing = [str(d) for d in expected_dates if d not in found_dates]
            raise ValueError(
                f"Missing {len(missing)} of the required 7 consecutive historical days for {station_id}: {missing}"
            )

        records = []
        for _, row in found_rows.iterrows():
            aqi_val = float(row["AQI"])
            cat = self.get_aqi_category_info(aqi_val)
            rec = {
                "date": str(row["Date"].date()),
                "aqi": round(aqi_val, 1),
                "aqi_category": cat["category"],
                "category_color": cat["color"]
            }
            for p in ALL_POLLUTANTS:
                if p in row.index and pd.notna(row[p]):
                    rec[p] = float(row[p])
                    rec[p.lower().replace(".", "")] = float(row[p])
            records.append(rec)

        return records
