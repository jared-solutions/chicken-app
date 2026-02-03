import React, { useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, TextField, Button } from '@mui/material';

// Backend API URL - Update this when deploying to production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://joe-farm-backend.onrender.com';

// Helper function to get local date in YYYY-MM-DD format (respects timezone)
const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RecordedData = () => {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cages/reports/egg-collection-table/?date=${selectedDate}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const renderPartition = (partitionData, boxesPerRow, title) => (
    <Box mt={2}>
      <Typography variant="h6">{title}</Typography>
      {Array.from({ length: 4 }, (_, rowIndex) => (
        <Box key={rowIndex} mb={1} display="flex" gap={0.5} flexWrap="wrap">
          {partitionData.slice(rowIndex * boxesPerRow, (rowIndex + 1) * boxesPerRow).map((box, colIndex) => (
            <Box
              key={colIndex}
              p={1}
              border={1}
              borderRadius={1}
              textAlign="center"
              minWidth="40px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {box.box}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {box.eggs}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box p={2} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Recorded Egg Collection Data
      </Typography>

      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          type="date"
          label="Select Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {data && (
        <>
          <Box mb={3}>
            <Typography variant="h5" gutterBottom>
              Date: {data.date}
            </Typography>
            <Typography variant="body1">
              Grand Total: {data.grand_total} eggs
            </Typography>
            <Typography variant="body1">
              Shade Eggs: {data.shade_total} eggs
            </Typography>
            <Typography variant="body1">
              Laying Percentage: {data.laying_percentage}%
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              {data.performance_comment}
            </Typography>
          </Box>

          {data.cages.map((cage) => (
            <Card key={cage.cage_id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cage {cage.cage_id} - Total: {cage.cage_total} eggs
                </Typography>

                {(() => {
                  const boxesPerRow = cage.cage_id === 1 ? 8 : 4;
                  return (
                    <>
                      {renderPartition(cage.front_partition, boxesPerRow, "Front Partition")}
                      {renderPartition(cage.middle1_partition, boxesPerRow, "Middle1 Partition")}
                      {renderPartition(cage.middle2_partition, boxesPerRow, "Middle2 Partition")}
                      {renderPartition(cage.back_partition, boxesPerRow, "Back Partition")}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  );
};

export default RecordedData;