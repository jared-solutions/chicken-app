# Jared Farm - Chicken Farm Management System

A comprehensive web application for managing Jared Farm's chicken farm operations, including egg production tracking, sales management, expense tracking, and detailed analytics.

## Features

### 🏠 Dashboard
- Real-time farm overview with key performance indicators
- Today's egg production with detailed cage/partition breakdown
- Store inventory tracking
- Flock size monitoring
- Monthly expense tracking

### 📝 Daily Tasks
- **Egg Collection**: Record daily egg collection from all cages
- **Sales Management**: Track egg sales and revenue
- **Expense Tracking**: Record daily farm expenses
- **Medical Records**: Track chicken health and treatments
- **Feed Management**: Record feed purchases and consumption

### 📋 Reports & Analytics
- **Performance Reports**: Detailed egg collection performance
- **Sales Reports**: Revenue analysis and sales history
- **Expense Reports**: Cost tracking and analysis
- **Medical Reports**: Health and treatment records
- **Egg Collection Tables**: Visual tables showing egg distribution by cage and partition

### 🐔 Farm Management
- User management (owners and workers)
- Chicken count tracking
- Feed consumption monitoring
- Settings and configuration

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: Token-based authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nyangaresi-farm
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../chiken-backend
   pip install -r requirements.txt
   ```

4. **Set up the database**
   ```bash
   python manage.py migrate
   ```

5. **Start the development servers**
   ```bash
   # Backend (in chiken-backend directory)
   python manage.py runserver

   # Frontend (in nyangaresi-farm directory)
   npm start
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Owners
- Access the owner dashboard for comprehensive farm management
- View detailed analytics and reports
- Manage users and farm settings
- Track all farm operations and financials

### For Workers
- Record daily egg collection
- Submit data for processing
- View basic farm information

## Key Features

### Egg Production Tracking
- Real-time egg collection recording
- Cage-by-cage and partition-by-partition tracking
- Shade egg collection
- Historical data analysis

### Financial Management
- Sales tracking with pricing
- Expense categorization
- Profit/loss calculations
- Feed cost monitoring

### Health Management
- Medical treatment records
- Vaccination tracking
- Health expense monitoring

### Analytics & Reporting
- Performance dashboards
- Trend analysis
- PDF report generation
- Data export capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Jared Farm.

## Support

For support or questions, please contact the farm management team.
