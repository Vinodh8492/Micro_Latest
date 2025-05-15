import React, { useState, useEffect } from 'react';
import GaugeChart from 'react-gauge-chart';

const darkenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
};

const generateColorSteps = (baseColor, steps) => {
  const colors = [];
  for (let i = 0; i < steps; i++) {
    colors.push(darkenColor(baseColor, i * (30 / steps)));
  }
  return colors;
};

const CurrentWeightGauge = ({
  max = 5000,
  themeColor = '#00E0FF',
  isDarkMode = false,
}) => {
  const [weight, setWeight] = useState(0);
  const [connectionError, setConnectionError] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('http://127.0.0.1:5000/api/scale/live-weight');

    eventSource.onmessage = (event) => {
      try {
        const data = event.data;
        const numericValue = parseFloat(data.replace(/[^\d.-]/g, ''));
        if (!isNaN(numericValue)) {
          setIsConnected(true); // ✅ move here
          setWeight(numericValue);
        }
      } catch (error) {
        console.error('Error processing weight:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource connection error:', error);
      setIsConnected(false);
      setConnectionError(true);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const percent = Math.min(weight / max, 1);
  const arcCount = 6;
  const gradientColors = generateColorSteps(themeColor, arcCount);

  if (!isConnected && !connectionError) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: themeColor }}>
        🔄 Connecting to scale...
      </div>
    );
  }

  if (connectionError) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        ⚠️ Failed to connect to scale.
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        height: '70%',
        position: 'relative'
      }}>
        <GaugeChart
          id="current-weight-gauge"
          nrOfLevels={arcCount}
          arcsLength={Array(arcCount).fill(1 / arcCount)}
          colors={gradientColors}
          percent={percent}
          arcPadding={0.02}
          hideText
          needleColor={themeColor}
          needleBaseColor={themeColor}
          animate={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div style={{
  fontFamily: 'Rubik, sans-serif',
  fontWeight: 600,
  fontSize: '1.1rem',
  marginTop: '4px',
  letterSpacing: '0.3px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  flexWrap: 'nowrap',
  whiteSpace: 'nowrap',
  textAlign: 'center',
}}>
  <span style={{ color: themeColor }}>Scale:</span>
  {weight === 0
    ? <span style={{ color: 'gray' }}>0</span>
    : <>
        <span style={{ color: themeColor }}>{weight.toFixed(2)}</span>
        <span style={{ color: themeColor }}>Kgs</span>
      </>
  }
</div>

    </div>
  );
};

export default CurrentWeightGauge;
