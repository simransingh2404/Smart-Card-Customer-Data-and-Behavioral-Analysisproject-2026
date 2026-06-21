# Food Delivery Time Prediction using Machine Learning

A complete end-to-end Machine Learning project that predicts food delivery time based on operational, environmental, and logistical factors.
The project combines SQL analytics, data preprocessing, exploratory data analysis, machine learning, model evaluation, hyperparameter tuning, and deployment using Streamlit.

---

# Live Application

[Food Delivery Time Prediction App](https://fooddeliverytimeprediction-1208.streamlit.app/)

---

# Business Problem

Food delivery platforms often struggle with:

* inaccurate delivery estimates
* delayed deliveries
* customer dissatisfaction
* operational inefficiencies
* poor delivery planning during traffic and weather disruptions

Incorrect delivery predictions can lead to:

* reduced customer trust
* order cancellations
* lower platform ratings
* inefficient courier allocation
* increased operational costs

This project addresses these challenges by building a predictive system capable of estimating delivery time using historical delivery patterns and operational data.

---

# Solution Provided

This project predicts estimated delivery time using:

* delivery distance
* weather conditions
* traffic levels
* time of day
* vehicle type
* food preparation time
* courier experience

The prediction system helps simulate how real-world delivery platforms can use machine learning for:

* better ETA prediction
* operational planning
* delivery optimization
* customer transparency

---

# Business Impact

## Improved Customer Experience

More accurate delivery estimates improve customer trust and reduce frustration caused by delays.

## Better Operational Planning

Delivery partners and operations teams can estimate workload and allocate resources more efficiently.

## Traffic & Weather Analysis

The project identifies how external conditions impact delivery performance.

## Data-Driven Decision Making

The analysis helps businesses understand:

* which delivery conditions cause maximum delays
* which vehicle types perform better
* how preparation time affects delivery efficiency

## Scalable ML Workflow

The project demonstrates how machine learning can be integrated into logistics and delivery systems for predictive decision-making.

---

# Project Overview

This project follows a complete Data Science workflow:

## SQL Analytics

Performed business-focused SQL analysis using joins, aggregations, window functions, and CTEs.

## Data Cleaning & Preprocessing

Handled missing values and prepared structured ML-ready data.

## Exploratory Data Analysis (EDA)

Analyzed relationships between operational variables and delivery performance.

## Machine Learning

Built and evaluated multiple regression models for prediction.

## Deployment

Developed and deployed an interactive web application using Streamlit.

---

# Technologies Used

## Programming Languages

* Python
* SQL

## Database

* PostgreSQL

## Python Libraries

* Pandas
* NumPy
* Scikit-learn
* XGBoost
* Matplotlib
* Seaborn
* Joblib
* Streamlit

---

# Dataset Features

| Feature                | Description                              |
| ---------------------- | ---------------------------------------- |
| order_id               | Unique delivery order ID                 |
| distance_km            | Distance between restaurant and customer |
| weather                | Weather condition during delivery        |
| traffic_level          | Traffic congestion level                 |
| time_of_day            | Delivery time slot                       |
| vehicle_type           | Delivery vehicle used                    |
| preparation_time_min   | Food preparation duration                |
| courier_experience_yrs | Courier experience                       |
| delivery_time_min      | Actual delivery time (Target Variable)   |

---

# SQL Analysis Performed

The project includes detailed SQL-based business analysis such as:

* Average delivery time by weather
* Traffic impact on delivery duration
* Vehicle efficiency comparison
* Delivery ranking using window functions
* Previous vs next delivery trend analysis using LAG & LEAD
* Orders taking longer than average delivery time
* Experience-based delivery performance analysis
* Worst delivery condition combinations

### SQL Concepts Used

* JOINS
* GROUP BY
* AGGREGATE FUNCTIONS
* WINDOW FUNCTIONS
* CTEs
* CASE STATEMENTS
* DATA CLEANING

---

# Data Preprocessing

## Missing Value Handling

Missing values in:

* weather
* traffic level

were handled using:

```text id="w8z2gr"
Unknown
```

category replacement.

## Feature Encoding

Applied Label Encoding on categorical columns:

* Weather
* Traffic Level
* Time of Day
* Vehicle Type

## Data Preparation

Created ML-ready datasets for training and evaluation.

---

# Exploratory Data Analysis

Performed:

* correlation analysis
* heatmaps
* residual analysis
* model comparison
* feature relationship analysis

Key findings:

* distance strongly impacts delivery time
* high traffic significantly increases delays
* preparation time contributes heavily to final delivery duration
* certain weather conditions affect delivery efficiency

---

# Machine Learning Models Used

| Model                   | Purpose                     |
| ----------------------- | --------------------------- |
| Linear Regression       | Baseline prediction model   |
| Decision Tree Regressor | Non-linear pattern learning |
| Random Forest Regressor | Ensemble-based prediction   |
| XGBoost Regressor       | Advanced gradient boosting  |

---

# Model Evaluation Metrics

Used:

* RMSE (Root Mean Squared Error)
* MAE (Mean Absolute Error)
* R² Score

---

# Model Performance

| Model             | RMSE  | MAE   | R² Score |
| ----------------- | ----- | ----- | -------- |
| Linear Regression | 10.52 | 7.34  | 0.75     |
| Decision Tree     | 15.30 | 10.95 | 0.47     |
| Random Forest     | 10.05 | 7.03  | 0.77     |
| XGBoost           | 10.50 | 7.58  | 0.75     |

### Best Performing Model

* Random Forest Regressor
* Achieved approximately **0.78 R² Score** after hyperparameter tuning

---

# Hyperparameter Tuning

Improved model performance using hyperparameter tuning techniques.

Parameters optimized:

* n_estimators
* max_depth
* min_samples_split
* min_samples_leaf

---

# Deployment

The application was deployed using:

* [Streamlit Community Cloud](https://streamlit.io/cloud)
* [GitHub](https://github.com)

The deployed app allows users to:

* input delivery conditions
* select operational factors
* predict estimated delivery time instantly

---

# Streamlit Application Features

## Interactive Inputs

Users can select:

* weather condition
* traffic level
* vehicle type
* time of day

and enter:

* delivery distance
* preparation time
* courier experience

## Real-Time Prediction

The app instantly predicts estimated delivery time using the trained ML model.

---

# Project Structure

```text id="j4v9mz"
Food Delivery Time Prediction Project/
│
├── app.py
├── delivery_model.pkl
├── encoders.pkl
├── requirements.txt
├── README.md
├── Food_Delivery_Times.csv
└── SQL_Analysis.sql
```

---

# Installation

Clone the repository:

```bash id="8g4z0v"
git clone <repository-link>
```

Move into project directory:

```bash id="l6r2qn"
cd food-delivery-time-prediction
```

Install dependencies:

```bash id="4n4h34"
pip install -r requirements.txt
```

Run the Streamlit app:

```bash id="z3t1hx"
streamlit run app.py
```

---

# Future Improvements

* Implement OneHotEncoding
* Add API-based live weather integration
* Add advanced feature engineering
* Improve UI/UX design
* Integrate real-time tracking simulation
* Deploy using Docker and cloud infrastructure

---

# Author

Rishikant Tiwary
B.Tech CSE | Data Science & Analytics Projects

---

# Live Demo

[Food Delivery Time Prediction App](https://fooddeliverytimeprediction-1208.streamlit.app/?utm_source=chatgpt.com)
