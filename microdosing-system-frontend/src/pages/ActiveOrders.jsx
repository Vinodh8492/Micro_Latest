import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Orders from './Orders';
import { useDosing } from './DosingContext';
import Topbar from './Topbar';
import { useTopbar } from './TopbarContext';
import { useTheme } from "../context/ThemeContext";
import ScaleBar from './ScaleBar';
import { io } from 'socket.io-client';

const ActiveOrders = () => {
  const [order, setOrder] = useState({
    materials: [],
  });

  const { addDosingRecord } = useDosing();
  const { themeColor } = useTheme();
  const barcodeRefs = useRef({});
  const overlayBarcodeRef = useRef(null);
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannedCodeRef = useRef('');
  const [scannedDisplay, setScannedDisplay] = useState('');
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [actualValue, setActualValue] = useState(null);
  const [barcodeMatched, setBarcodeMatched] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const socket = useRef(null);

  useEffect(() => {
    // Function to fetch initial active material
    const fetchActiveMaterial = async () => {
      try {
        const activeResponse = await axios.get('http://127.0.0.1:5000/api/recipe_materials/active');
        if (activeResponse.data && activeResponse.data.recipe_name) {
          const rawMaterial = activeResponse.data;
          const transformedMaterial = {
            id: rawMaterial.material_id,
            title: rawMaterial.material_name,
            barcode: rawMaterial.barcode,
            setPoint: parseFloat(rawMaterial.set_point),
            actual: parseFloat(rawMaterial.actual),
            unit: '',
            recipe: rawMaterial.recipe_name,
            dosed: false,
            margin: rawMaterial.margin,
            status: rawMaterial.status,
          };
          setOrder(prev => ({
            ...prev,
            materials: [transformedMaterial],
            recipe_name: rawMaterial.recipe_name,
          }));
          return;
        }

        // Fallback to recipe materials if no active material
        const recipeResponse = await axios.get('http://127.0.0.1:5000/api/recipe_materials');
        const recipeMaterials = recipeResponse.data.materials || [];
        console.log(" recipe materials :", recipeMaterials)

        const enrichedMaterials = await Promise.all(
          recipeMaterials.map(async (mat, idx) => {
            try {
              const [recipeRes, materialRes] = await Promise.all([ 
                axios.get(`http://127.0.0.1:5000/api/recipes/${mat.recipe_id}`),
                axios.get(`http://127.0.0.1:5000/api/materials/${mat.material_id}`),
              ]);

              return {
                id: mat.recipe_material_id || idx + 1,
                title: materialRes.data?.title || `Material #${mat.material_id}`,
                recipeName: recipeRes.data?.name || `Recipe #${mat.recipe_id}`,
                barcode: materialRes.data?.barcode_id,
                setPoint: mat.set_point,
                actual: mat.actual,
                unit: materialRes.data?.unit_of_measure || '',
                status: mat.status,
                dosed: false,
                margin: materialRes.data?.margin,
              };
            } catch (innerErr) {
              alert(`Error fetching names for recipe_id ${mat.recipe_id} or material_id ${mat.material_id} : ${innerErr}`);
              return null;
            }
          })
        );

        const validMaterials = enrichedMaterials.filter(Boolean);
        setOrder(prev => ({
          ...prev,
          materials: validMaterials,
          recipe_name: validMaterials[0]?.recipeName || 'Formula A',
        }));

      } catch (error) {
        alert(`Error fetching materials: ${error}`);
      }
    };

    fetchActiveMaterial();

    // Step 3: Set up WebSocket connection
    socket.current = io('http://127.0.0.1:5000'); // URL to your backend socket server

    // Step 4: Listen for the `recipe_material_updated` event
    socket.current.on('recipe_material_updated', (updatedMaterial) => {
      console.log('Received updated material:', updatedMaterial);

      // Update the materials state when the update event is received
      setOrder((prevState) => {
        const updatedMaterials = prevState.materials.map((material) =>
          material.id === updatedMaterial.material_id
            ? { ...material, ...updatedMaterial }
            : material
        );
        return { ...prevState, materials: updatedMaterials };
      });
    });

    // Cleanup: Disconnect socket when the component is unmounted
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once


  

  useEffect(() => {
    if (order.materials.length > 0 && currentIndex < order.materials.length) {
      setCurrentMaterial(order.materials[currentIndex]);
    } else {
      setCurrentMaterial(null);
    }
  }, [order.materials, currentIndex]);

  useEffect(() => {
    Object.entries(barcodeRefs.current).forEach(([barcode, el]) => {
      if (el && window.JsBarcode) {
        window.JsBarcode(el, barcode, {
          format: "CODE128",
          displayValue: false,
          height: 30,
        });
      }
    });
  }, [order.materials]);

  useEffect(() => {
    if (scannedDisplay && overlayBarcodeRef.current && window.JsBarcode) {
      window.JsBarcode(overlayBarcodeRef.current, scannedDisplay, {
        format: "CODE128",
        displayValue: true,
        height: 60,
        fontSize: 16,
      });
    }
  }, [scannedDisplay]);

  useEffect(() => {
    if (!scanning || !currentMaterial) return;

    const expected = currentMaterial?.barcode?.trim();
    setScannedDisplay(expected);

    const timeoutId = setTimeout(() => {
      if (!expected) {
        alert(`⚠️ No barcode present for ${currentMaterial.title || currentMaterial.materialName}`);
        setBarcodeMatched(false);
        setScannedDisplay('');
        setScanning(false);
        return;
      }

      const isValidFormat = /^[A-Za-z0-9\-_.]{5,30}$/.test(expected);

      if (isValidFormat) {
        alert(`✅ Barcode is valid for ${currentMaterial.title || currentMaterial.materialName}`);
        setBarcodeMatched(true);
      } else {
        alert(`❌ Barcode format is invalid for ${currentMaterial.title || currentMaterial.materialName}`);
        setBarcodeMatched(false);
      }

      setScannedDisplay('');
      setScanning(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [scanning, currentMaterial]);

  const { setReqWeight } = useTopbar();

  useEffect(() => {
    if (currentMaterial?.setPoint) {
      setReqWeight(Number(currentMaterial.setPoint));
    }
  }, [currentMaterial]);



  const handleScan = async () => {
    if (!currentMaterial) {
      alert('No material selected for scanning.');
      return;
    }
  
    scannedCodeRef.current = '';
    setScanning(true);
    setScannedCode("");
    alert(`Scan the barcode for ${currentMaterial.title || currentMaterial.materialName}`);
  
    try {
      // Step 1: Barcode validation (already handled by useEffect with setTimeout)
  
      // Step 2: Call weigh-and-update API
      const response = await axios.post('http://127.0.0.1:5000/api/recipe_materials/weigh-and-update');
  
      if (response.data.success) {
        const updated = response.data.data;
  
        // Update UI state
        setOrder(prev => {
          const updatedMaterials = [...prev.materials];
          updatedMaterials[currentIndex] = {
            ...updatedMaterials[currentIndex],
            actual: updated.actual,
            margin: updated.margin,
            dosed: true,
          };
          return { ...prev, materials: updatedMaterials };
        });
  
        setActualValue(updated.actual);
        setBarcodeMatched(true);
        setScaleStatus('success');
        setShowScalePopup(true);
        setTimeout(() => setShowScalePopup(false), 3000);
  
        // Optional: Advance automatically to next material
        setTimeout(() => {
          advanceToNext();
        }, 1000);
  
      } else {
        alert("Failed to weigh and update: " + response.data.message);
        setBarcodeMatched(false);
      }
  
    } catch (error) {
      alert("Error during weighing and updating: " + error);
      setBarcodeMatched(false);
    } finally {
      setScanning(false);
    }
  };
  

  const [showScalePopup, setShowScalePopup] = useState(false);
  const [scaleStatus, setScaleStatus] = useState(""); // 'outOfRange' or 'success'
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  useEffect(() => {
    if (showScalePopup) {
      setIndicatorWidth(0); // Reset indicator width to 0
      const interval = setInterval(() => {
        setIndicatorWidth(prevWidth => {
          if (prevWidth < 100) {
            return prevWidth + 2; // Increase width by 2% every 50ms
          } else {
            clearInterval(interval); // Stop when it's full
            return 100;
          }
        });
      }, 50); // Adjust speed by changing interval (50ms)

      // Automatically close the popup after 3 seconds
      const timer = setTimeout(() => {
        setShowScalePopup(false);
      }, 3000); // Close popup after 3 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [showScalePopup]);

  const confirmDosing = async () => {
    if (!currentMaterial || currentMaterial.setPoint === undefined) {
      alert("Material or set point is missing.");
      return;
    }

    const setWeight = parseFloat(currentMaterial.setPoint);
    const actualWeight = parseFloat(currentMaterial.actual);
    const margin = parseFloat(currentMaterial.margin.replace('%', ''));

    const minAcceptable = actualWeight * (1 - margin / 100);
    const maxAcceptable = actualWeight * (1 + margin / 100);

    if (setWeight < minAcceptable || setWeight > maxAcceptable) {
      setScaleStatus('outOfRange');
      setShowScalePopup(true);
      setTimeout(() => setShowScalePopup(false), 3000);
      return;
    }

    try {
      const dosingRecord = {
        orderId: order.order_id,
        recipeName: order.recipe_name,
        materialId: currentMaterial.id,
        materialName: currentMaterial.title,
        setPoint: setWeight,
        actual: actualWeight,
        unit: currentMaterial.unit,
        timestamp: new Date().toISOString(),
        status: 'completed',
        margin: margin
      };

      addDosingRecord(dosingRecord);

      setOrder(prev => {
        const updatedMaterials = [...prev.materials];
        updatedMaterials[currentIndex] = {
          ...updatedMaterials[currentIndex],
          actual: actualWeight,
          dosed: true,
        };
        return { ...prev, materials: updatedMaterials };
      });

      // ✅ Show green popup for success
      setScaleStatus('success');
      setShowScalePopup(true);

      setTimeout(() => setShowScalePopup(false), 3000);

      advanceToNext();
    } catch (error) {
      alert(`Error saving dosing record: ${error}`);
    }
  };

  const ScalePopup = ({ scaleStatus, onClose }) => {
    const backgroundColor = scaleStatus === "outOfRange" ? "#ffe5e5" : "#e5ffe5";
    const indicatorColor = scaleStatus === "outOfRange" ? "red" : "green";
    const message = scaleStatus === "outOfRange"
      ? " Dosing out of margin!"
      : " Dosing completed successfully!";


    const overlayStyles = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',  // Light dim background
      zIndex: 999,  // Behind the popup but in front of other content
    };

    const scalePopupStyles = {
      position: 'fixed',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: backgroundColor,
      border: `2px solid ${indicatorColor}`,
      padding: '20px',
      width: '300px',
      textAlign: 'center',
      borderRadius: '10px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
    };

    const scaleBarStyles = {
      width: '100%',
      height: '20px',
      backgroundColor: '#e0e0e0',
      borderRadius: '10px',
      position: 'relative',
      marginBottom: '20px',
    };

    const scaleIndicatorStyles = {
      position: 'absolute',
      top: '0',
      height: '100%',
      width: `${indicatorWidth}%`,
      borderRadius: '10px',
      left: '0',
      backgroundColor: indicatorColor,
      transition: 'width 0.05s',
    };

    const scaleMessageStyles = {
      fontSize: '18px',
      marginBottom: '20px',
      fontWeight: 'bold',
      color: indicatorColor
    };

    const buttonStyles = {
      padding: '10px 15px',
      backgroundColor: indicatorColor,
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    };

    return (
      <div style={overlayStyles}>
        <div style={scalePopupStyles}>
          <div style={scaleBarStyles}>
            <div style={scaleIndicatorStyles}></div>
          </div>
          <div style={scaleMessageStyles}>{message}</div>
          {/* <button
          style={buttonStyles}
          onClick={onClose}
        >
          Close
        </button> */}
        </div>
      </div>
    );
  };

  const bypassMaterial = () => {
    // Create bypass record
    const bypassRecord = {
      orderId: order.order_id,
      recipeName: order.recipe_name,
      materialId: currentMaterial.id,
      materialName: currentMaterial.title,
      setPoint: currentMaterial.setPoint,
      actual: 0,
      unit: currentMaterial.unit,
      timestamp: new Date().toISOString(),
      status: 'bypassed',
      margin: currentMaterial.margin
    };

    // Save to context
    addDosingRecord(bypassRecord);

    // Update local state
    setOrder(prev => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[currentIndex] = {
        ...updatedMaterials[currentIndex],
        dosed: true,
        bypassed: true,
      };
      return { ...prev, materials: updatedMaterials };
    });

    advanceToNext();
  };

  const advanceToNext = () => {
    setActualValue('');
    setBarcodeMatched(false);

    if (currentIndex + 1 < order.materials.length) {
      setCurrentIndex(prev => prev + 1);
    } else {

    }
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;  // This will give you the role of the user, or undefined if not found


  const [sendWeight, setSendWeight] = useState(false)


  return (
    <div className="p-6 text-black bg-white min-h-screen">
      <Orders />
      <h2 className="text-3xl font-bold mb-6">Active Order: {order.recipe_name}</h2>

      {/* Scan Button */}
      <div className="mb-4 flex gap-4 items-center">
        <button
          onClick={handleScan}
          className="bg-indigo-600 text-white px-6 py-2 rounded shadow-md hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-qrcode"></i> Start Barcode Scan
        </button>

        <span className="text-lg font-medium">
          {barcodeMatched ? '✅ Scanned Successfully' : 'Waiting for scan...'}
        </span>
        {currentMaterial && (
                  <div className="flex-shrink-0">
                    <ScaleBar
                      actual={currentMaterial.actual}
                      setPoint={currentMaterial.setPoint}
                      margin={currentMaterial.margin || 0.05}
                    />
                  </div>
                )}
              
        
      </div>


      {/* Materials Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border bg-gray-200">
          <thead className="bg-gray-300 text-sm">
            <tr>
              <th className="p-3 border">Formula</th>
              <th className="p-3 border">Material</th>
              <th className="p-3 border">Barcode</th>
              <th className="p-3 border">Set Point</th>
              <th className="p-3 border">Actual</th>
              <th className="p-3 border">Err%</th> 
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {order.materials.map((mat, idx) => (
              <tr
                key={mat.id}
                className={
                  idx === currentIndex
                    ? 'bg-blue-50'
                    : mat.dosed
                      ? 'bg-green-100'
                      : 'bg-white'
                }
              >
                <td className="p-3 border">{mat.recipe || mat.recipeName}</td>
                <td className="p-3 border font-semibold">{mat.title}</td>
                <td className="p-3 border text-sm">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs text-gray-400">{mat.barcode}</span>
                    {mat.barcode ? (
                      <svg
                        ref={(el) => (barcodeRefs.current[mat.barcode] = el)}
                        style={{ width: '100%', maxWidth: '150px', height: '40px', objectFit: 'contain' }}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Barcode</span>
                    )}
                  </div>
                </td>
                <td className="p-3 border">{mat.setPoint}</td>

<td className="p-3 border">
  {idx === currentIndex && mat.dosed
    ? actualValue !== undefined && actualValue !== null
      ? mat.actual
      : '—'
    : mat.actual !== undefined && mat.actual !== null
      ? mat.actual
      : '—'}
</td>

<td className="p-3 border">
  {mat.setPoint !== undefined && mat.setPoint !== null &&
   mat.actual !== undefined && mat.actual !== null
    ? `${Math.abs(((Number(mat.actual) - Number(mat.setPoint)) / Number(mat.setPoint)) * 100).toFixed(2)}%`
    : '—'}
</td>

<td className="p-3 border">
  {mat.dosed
    ? mat.bypassed
      ? 'Bypassed'
      : 'Dosed ✅'
    : idx === currentIndex
      ? 'In Progress'
      : 'Pending'}
</td>
                <td className="p-3 border">
                  {idx === currentIndex && !mat.dosed && (
                    <div className="flex gap-2">
                      <button
                        onClick={confirmDosing}
                        className="bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition"
                      >
                        ✅ Confirm
                      </button>
                      {userRole === "admin" && (
                        <button
                          onClick={bypassMaterial}
                          className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700 transition"
                        >
                          🚫 Bypass
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {showScalePopup && (
        <ScalePopup
          scaleStatus={scaleStatus}
          onClose={() => setShowScalePopup(false)}
        />
      )}


      {scannedDisplay && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#222',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          fontSize: '18px',
          zIndex: 1000,
          fontWeight: 'bold',
        }}>
          <p style={{ fontSize: '20px', marginBottom: '10px' }}>Verifying Barcode: {scannedDisplay}</p>
          <svg ref={overlayBarcodeRef}></svg>
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;