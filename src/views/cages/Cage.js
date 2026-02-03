import React, { useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, TextField } from '@mui/material';

const Cage = ({ cage, onEggDataChange }) => {
  const [eggData, setEggData] = useState({});
  const [errorMessages, setErrorMessages] = useState({});

  const handleEggChange = (cageId, partitionIndex, rowIndex, colIndex, value, event) => {
    const numValue = parseInt(value, 10);
    if (numValue > 4) {
      setErrorMessages((prevErrors) => ({
        ...prevErrors,
        [`${cageId}-${partitionIndex}-${rowIndex}-${colIndex}`]: "Cannot collect more than 4 eggs",
      }));
      return;
    }

    setErrorMessages((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`${cageId}-${partitionIndex}-${rowIndex}-${colIndex}`];
      return newErrors;
    });

    setEggData((prevData) => {
      const newData = {
        ...prevData,
        [`${cageId}-${partitionIndex}-${rowIndex}-${colIndex}`]: numValue || '',
      };
      return newData;
    });

    // Pass the updated egg data to parent component with box number
    if (onEggDataChange) {
      onEggDataChange(prevData => ({
        ...prevData,
        [cageId]: {
          ...prevData[cageId],
          [`${cageId}-${partitionIndex}-${rowIndex}-${colIndex}`]: {
            count: numValue || 0,
            boxNumber: colIndex + 1, // Box numbers are 1-based
            partitionIndex: partitionIndex,
            cageId: cageId
          },
        }
      }));
    }

    // Auto-focus next input field if a number was entered
    if (numValue >= 0 && numValue <= 4 && event) {
      setTimeout(() => {
        const currentInput = event.target;
        const allInputs = document.querySelectorAll('input[type="number"]');
        const currentIndex = Array.from(allInputs).indexOf(currentInput);

        if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
          const nextInput = allInputs[currentIndex + 1];
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          }
        }
      }, 100);
    }
  };

  const groupPartitions = (partitions, cageType) => {
    if (cageType === 'combined') {
      // For combined cage: 4x8 layout (4 rows x 8 columns) - numbered 1-8, repeated 4 times
      return [{
        ...partitions[0],
        rows: Array.from({ length: 4 }, (_, rowIndex) => {
          return {
            columns: Array.from({ length: 8 }, (_, colIndex) => {
              return { id: `0-${rowIndex}-${colIndex}`, chickens: colIndex + 1 };
            })
          };
        })
      }];
    } else {
      // For standard cage: 4x4 layout (4 rows x 4 columns) per partition - Front and Back only (2 partitions)
      return partitions.slice(0, 2).map((partition, partitionIndex) => {
        return {
          ...partition,
          rows: Array.from({ length: 4 }, (_, rowIndex) => {
            return {
              columns: Array.from({ length: 4 }, (_, colIndex) => {
                return { id: `${partitionIndex}-${rowIndex}-${colIndex}`, chickens: colIndex + 1 };
              })
            };
          })
        };
      });
    }
  };

  // Removed individual cage submit function - now using centralized submission

  return (
    <Box p={2} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Joe Farm - Cage {cage.id}
      </Typography>
      {cage.type === 'combined' ? (
        // Combined cage: front and back partitions shown separately but both 4x4
        <>
          {["Front Partition", "Back Partition"].map((partitionLabel, partitionIdx) => (
            <Box key={partitionIdx} mt={4}>
              <Typography variant="h5" gutterBottom>
                {partitionLabel}
              </Typography>
              <Grid container spacing={2}>
                {groupPartitions([cage.partitions[partitionIdx]], cage.type).map((partition, partitionIndex) => (
                  <Grid item xs={12} key={partitionIndex}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">Partition {partitionIndex + 1}</Typography>
                        {partition.rows.map((row, rowIndex) => (
                          <Box key={rowIndex} mb={1} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: '4px' }, scrollBehavior: 'smooth' }}>
                            <Box display="flex" gap={0.5} sx={{ width: 'max-content', pl: 1, pr: 1 }}>
                              {row.columns.map((col, colIndex) => (
                                <Box key={col.id} p={0.5} border={1} borderRadius={1} textAlign="center" width="55px" flexShrink={0}>
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{col.chickens}</Typography>
                                  <TextField
                                    type="number"
                                    label=""
                                    variant="outlined"
                                    size="small"
                                    value={eggData[`${cage.id}-${partitionIdx}-${rowIndex}-${colIndex}`] || ''}
                                    onChange={(e) => handleEggChange(cage.id, partitionIdx, rowIndex, colIndex, e.target.value, e)}
                                    error={!!errorMessages[`${cage.id}-${partitionIdx}-${rowIndex}-${colIndex}`]}
                                    helperText={errorMessages[`${cage.id}-${partitionIdx}-${rowIndex}-${colIndex}`] || ''}
                                    inputProps={{
                                      style: { textAlign: 'center', padding: '2px', fontSize: '0.8rem' },
                                      min: 0,
                                      max: 4
                                    }}
                                    sx={{ '& .MuiInputBase-input': { padding: '2px 4px' } }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </>
      ) : (
        // Standard cage: separate front and back partitions
        <>
          {["Front Partition", "Back Partition"].map((partitionLabel, partitionIdx) => (
            <Box key={partitionIdx} mt={4}>
              <Typography variant="h5" gutterBottom>
                {partitionLabel}
              </Typography>
              <Grid container spacing={2}>
                {groupPartitions([cage.partitions[partitionIdx]], cage.type).map((partition, partitionIndex) => (
                  <Grid item xs={12} key={partitionIndex}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">Partition {partitionIndex + 1}</Typography>
                        {partition.rows.map((row, rowIndex) => (
                          <Box key={rowIndex} mb={1} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: '4px' }, scrollBehavior: 'smooth' }}>
                            <Box display="flex" gap={0.5} sx={{ width: 'max-content', pl: 1, pr: 1 }}>
                              {row.columns.map((col, colIndex) => (
                                <Box key={col.id} p={0.5} border={1} borderRadius={1} textAlign="center" width="55px" flexShrink={0}>
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{col.chickens}</Typography>
                                  <TextField
                                    type="number"
                                    label=""
                                    variant="outlined"
                                    size="small"
                                    value={eggData[`${cage.id}-${partitionIdx}-${rowIndex}-${colIndex}`] || ''}
                                    onChange={(e) => handleEggChange(cage.id, partitionIdx, rowIndex, colIndex, e.target.value, e)}
                                    error={!!errorMessages[`${cage.id}-${partitionIdx}-${rowIndex}-${colIndex}`]}
                                    helperText={errorMessages[`${cage.id}-${partitionIdx}-${rowIndex}-${colIndex}`] || ''}
                                    inputProps={{
                                      style: { textAlign: 'center', padding: '2px', fontSize: '0.8rem' },
                                      min: 0,
                                      max: 4
                                    }}
                                    sx={{ '& .MuiInputBase-input': { padding: '2px 4px' } }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default Cage;
