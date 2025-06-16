import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Calendar, MapPin, Phone, FileText, 
  ChevronLeft, ChevronRight, Table, Grid, Upload, Download 
} from 'lucide-react';
import * as XLSX from 'xlsx';

const WorkScheduleManager = () => {
  const [currentView, setCurrentView] = useState('table');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));

 const [importModalOpen, setImportModalOpen] = useState(false);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [fileData, setFileData] = useState(null);
 const [importError, setImportError] = useState('');

  
  const [scheduleData, setScheduleData] = useState(() => {
    const savedData = localStorage.getItem('workScheduleData');
    return savedData ? JSON.parse(savedData) : [
      {
      }
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    dates: [],
    notes: ''
  });
  const [dateInput, setDateInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    localStorage.setItem('workScheduleData', JSON.stringify(scheduleData));
  }, [scheduleData]);

 const eventsMap = useMemo(() => {
  const map = new Map();
  scheduleData.forEach(customer => {
    customer.dates?.forEach(dateStr => {
      // Parse the date without timezone adjustments
      const date = new Date(dateStr);
      const key = date.toISOString().split('T')[0]; // Use ISO format for consistency
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push({
        ...customer,
        date: dateStr
      });
    });
  });
  return map;
}, [scheduleData]);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      dates: [],
      notes: ''
    });
    setDateInput('');
    setEditingId(null);
    setShowAddForm(false);
    setShowQuickAdd(false);
    setSelectedDate(null);
  };

  const handleAddCustomer = () => {
    setShowAddForm(true);
    resetForm();
  };

  const handleEditCustomer = (customer) => {
    setFormData({
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      dates: [...customer.dates],
      notes: customer.notes
    });
    setEditingId(customer.id);
    setShowAddForm(true);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setScheduleData(prev => prev.filter(customer => customer.id !== id));
    }
  };

  const handleSaveCustomer = () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please fill in at least the customer name and address.');
      return;
    }

    if (editingId) {
      setScheduleData(prev => prev.map(customer => 
        customer.id === editingId 
          ? { ...customer, ...formData }
          : customer
      ));
    } else {
      const newCustomer = {
        id: Date.now(),
        ...formData
      };
      setScheduleData(prev => [...prev, newCustomer]);
    }
    
    resetForm();
  };

  const handleAddDate = () => {
  if (dateInput) {
    // Parse the date string and adjust for timezone
    const date = new Date(dateInput);
    // Add the timezone offset to get the correct date
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const formattedDate = date.toISOString().split('T')[0];
    
    if (!formData.dates.includes(formattedDate)) {
      setFormData(prev => ({
        ...prev,
        dates: [...prev.dates, formattedDate].sort()
      }));
      setDateInput('');
    }
  }
};

  const handleRemoveDate = (dateToRemove) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter(date => date !== dateToRemove)
    }));
  };

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddDate();
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

const openQuickAdd = (dateKey) => {
  const date = new Date(dateKey);
  // Adjust for timezone before setting
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const formattedDate = date.toISOString().split('T')[0];
  
  setSelectedDate(formattedDate);
  setFormData({
    name: '',
    address: '',
    phone: '',
    dates: [formattedDate],
    notes: ''
  });
  setShowQuickAdd(true);
};

  const handleQuickAdd = () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please fill in at least the customer name and address.');
      return;
    }

    const newCustomer = {
      id: Date.now(),
      ...formData
    };
    setScheduleData(prev => [...prev, newCustomer]);
    resetForm();
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `work-schedule-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

 const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('No sheets found in this file');
        }

        setAvailableSheets(workbook.SheetNames);
        setFileData(workbook);
        setSelectedSheet(workbook.SheetNames[0]);
        setImportModalOpen(true);
      } catch (error) {
        setImportError(`Error reading file: ${error.message}`);
        console.error('File read error:', error);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file');
    };
    reader.readAsArrayBuffer(file);
  };

  // Process the selected sheet
  const handleImportConfirm = () => {
  if (!fileData || !selectedSheet) {
    setImportError('No sheet selected');
    return;
  }

  try {
    const worksheet = fileData.Sheets[selectedSheet];
    if (!worksheet) throw new Error('Selected sheet not found');

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false
    });

    const processedData = processExcelData(jsonData);
    
    if (processedData.length === 0) {
      throw new Error('No valid data found in this sheet');
    }

    setScheduleData(processedData);
    setImportModalOpen(false);
  } catch (error) {
    setImportError(error.message);
  }
};


   const processExcelData = (excelRows) => {
  const results = [];
  
  // Skip header row (row 0) and process each customer row
  for (let i = 1; i < excelRows.length; i++) {
    try {
      const row = excelRows[i];
      if (!row || !row[1]) continue; // Skip empty rows (checking column B)

      // Extract customer info from columns B-E
      const customerInfo = {
        name: row[1] ? String(row[1]).trim() : '',
        address: row[2] ? String(row[2]).trim() : '',
        phone: row[3] ? formatPhoneNumber(String(row[3])) : '',
        compactor: row[4] ? String(row[4]).trim() : '',
        notes: [
          row[5] ? String(row[5]).trim() : '',
          row[6] ? String(row[6]).trim() : '',
          row[7] ? String(row[7]).trim() : '',
          row[8] ? String(row[8]).trim() : ''
        ].filter(Boolean).join(' | ')
      };

      if (!customerInfo.name) continue;

      // Process dates from columns I onward (column 8)
      const dates = [];
      for (let j = 8; j < row.length; j++) {
        const dateValue = parseExcelDate(row[j]);
        if (dateValue) dates.push(dateValue);
      }

      if (dates.length > 0) {
        results.push({
          id: Date.now() + i,
          name: customerInfo.name,
          address: customerInfo.address,
          phone: customerInfo.phone,
          dates: dates,
          notes: customerInfo.notes,
          compactor: customerInfo.compactor // Additional field
        });
      }
    } catch (error) {
      console.warn(`Skipping row ${i} due to error:`, error);
    }
  }

  return results;
};


const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  // Return original if not standard US phone number
  return phone;
};

const parseExcelDate = (value) => {
  if (!value) return null;
  
  try {
    let date;
    
    // Handle Excel serial dates (numbers)
    if (typeof value === 'number') {
      // Excel serial date (days since 1900)
      date = new Date(Math.round((value - 25569) * 86400 * 1000));
    } 
    // Handle string dates
    else if (typeof value === 'string') {
      // Try parsing as ISO date first
      date = new Date(value);
      
      // If that fails, try MM/DD/YYYY format
      if (isNaN(date.getTime())) {
        const [month, day, year] = value.split('/').map(Number);
        date = new Date(year, month - 1, day);
      }
    }
    // Handle Date objects directly
    else if (value instanceof Date) {
      date = value;
    }
    
    if (!date || isNaN(date.getTime())) return null;
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
};

const parseDateString = (value, format) => {
  const formatParts = format.split(/[\/\-]/);
  const valueParts = value.split(/[\/\-]/);
  
  if (formatParts.length !== valueParts.length) return new Date(NaN);
  
  const dateParts = {};
  for (let i = 0; i < formatParts.length; i++) {
    const part = formatParts[i].toLowerCase();
    if (part.includes('m')) dateParts.month = parseInt(valueParts[i]) - 1;
    else if (part.includes('d')) dateParts.day = parseInt(valueParts[i]);
    else if (part.includes('y')) {
      dateParts.year = parseInt(valueParts[i]);
      if (dateParts.year < 100) { // Handle 2-digit years
        dateParts.year += dateParts.year < 50 ? 2000 : 1900;
      }
    }
  }
  
  return new Date(dateParts.year, dateParts.month, dateParts.day);
};

  const extractCustomerInfo = (str) => {
    const result = { name: '', address: '', phone: '' };
    
    const parts = str.split('-').map(part => part.trim());
    
    const nameAddress = parts[0].trim();
    const lastComma = nameAddress.lastIndexOf(',');
    
    if (lastComma > 0) {
      result.name = nameAddress.substring(0, lastComma).trim();
      result.address = nameAddress.substring(lastComma + 1).trim();
    } else {
      result.name = nameAddress;
    }
    
    if (parts.length > 1 && parts[1]) {
      result.phone = parts[1].replace(/\D/g, '');
      if (result.phone.length === 10) {
        result.phone = `${result.phone.substring(0, 3)}-${result.phone.substring(3, 6)}-${result.phone.substring(6)}`;
      }
    }
    
    return result;
  };

  const isValidDate = (value) => {
    if (value instanceof Date) return true;
    if (typeof value === 'string' && !isNaN(new Date(value).getTime())) return true;
    if (typeof value === 'number' && value > 0) return true;
    return false;
  };

  const formatExcelDate = (value) => {
  let date;
  
  if (typeof value === 'number') {
    // Excel serial date (days since 1900)
    date = new Date((value - (25567 + 2)) * 86400 * 1000);
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }
  
  // Adjust for timezone
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};


  const renderCalendarDays = () => {
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];
  
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-40 border border-gray-200 bg-gray-50"></div>);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Use local date string for matching
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    const dayEvents = eventsMap.get(dateKey) || [];
    
    const minHeight = Math.max(160, 40 + (dayEvents.length * 70));
    
    days.push(
      <div 
        key={day} 
        className="border border-gray-200 p-2 bg-white hover:bg-gray-50 flex flex-col"
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-sm text-gray-700">{day}</div>
          <button
            onClick={() => openQuickAdd(dateKey)}
            className="p-1 rounded hover:bg-blue-100 text-blue-600"
            title="Add work"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
          <div className="space-y-1 flex-1">
            {dayEvents.map((event, index) => (
              <div
                key={index}
                className="text-xs p-2 rounded bg-blue-100 border-l-2 border-blue-500 hover:bg-blue-200 relative group"
              >
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex space-x-1">
                  <button
                    onClick={() => handleEditCustomer(event)}
                    className="p-1 rounded hover:bg-blue-200 text-blue-700"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(event.id)}
                    className="p-1 rounded hover:bg-red-200 text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-medium text-blue-800 text-xs leading-tight mb-1 pr-8">
                  {event.name}
                </div>
                <div className="text-blue-600 flex items-start text-xs leading-tight mb-1">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{event.address}</span>
                </div>
                {event.phone && (
                  <div className="text-blue-600 flex items-center text-xs leading-tight mb-1">
                    <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>{event.phone}</span>
                  </div>
                )}
                {event.notes && (
                  <div className="text-blue-700 text-xs leading-tight font-medium">
                    {event.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

const todayEvents = useMemo(() => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return eventsMap.get(todayKey) || [];
}, [eventsMap]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Work Schedule Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('table')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  currentView === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  currentView === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Calendar</span>
              </button>
            </div>
            
            <div className="flex space-x-2">
              <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Import Excel</span>
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                 onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleExportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            
            <button
              onClick={handleAddCustomer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

 {/* Sheet Selection Modal */}
        {importModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Select Sheet to Import</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                 Available Sheets ({availableSheets.length})
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {availableSheets.map((sheet, index) => (
                   <option key={index} value={sheet}>
                      {sheet} {index === 0 ? "(First Sheet)" : ""}
                    </option>
                  ))}
                </select>

 {importError && (
                  <div className="text-red-500 text-sm mb-4">
                    {importError}
                  </div>
                )}

              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {fileData && `File: ${fileData.FileName || 'Selected file'}`}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setImportModalOpen(false);
                      setImportError('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!selectedSheet}
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {currentView === 'calendar' && (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-700 min-w-48 text-center">
              {formatMonthYear(currentDate)}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentView === 'calendar' && todayEvents.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Today's Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todayEvents.map((event, index) => (
                <div key={index} className="bg-white p-3 rounded border border-yellow-200">
                  <div className="font-medium text-gray-800">{event.name}</div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.address}
                  </div>
                  {event.phone && (
                    <div className="text-sm text-gray-600 flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-1" />
                      {event.phone}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{event.notes}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(showAddForm || showQuickAdd) && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit Customer' : showQuickAdd ? 'Quick Add Work' : 'Add New Customer'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full address"
              />
            </div>

            {!showQuickAdd && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Dates
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => {
    // Parse and adjust the date for display
    const date = new Date(e.target.value);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    setDateInput(date.toISOString().split('T')[0]);
  }}
                    onKeyPress={handleKeyPress}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddDate}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Add Date
                  </button>
                </div>
                
                {formData.dates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.dates.map((date, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{formatDate(date)}</span>
                        <button
                          onClick={() => handleRemoveDate(date)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes or schedule details"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={showQuickAdd ? handleQuickAdd : handleSaveCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {currentView === 'table' ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Customer Name</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Address</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Phone</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Work Dates</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Notes</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 font-medium text-gray-800">
                        {customer.name}
                      </td>
                      <td className="border border-gray-300 p-3 text-gray-600">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="break-words">{customer.address}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3 text-gray-600">
                        {customer.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex flex-wrap gap-1">
                          {customer.dates?.map((date, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs whitespace-nowrap"
                            >
                              {formatDate(date)}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {customer.dates?.length} scheduled days
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3 text-gray-600">
                        {customer.notes && (
                          <div className="flex items-start">
                            <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="break-words text-sm">{customer.notes}</span>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {scheduleData.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No customers added yet</p>
                <p className="text-sm">Click "Add Customer" to get started</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="bg-gray-100 p-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                  {day}
                </div>
              ))}
              
              {renderCalendarDays()}
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <p className="mb-2"><strong>Instructions:</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-1">• Click the <Plus className="w-4 h-4 inline" /> button on any day to add new work</p>
                  <p className="mb-1">• Hover over events to see edit/delete options</p>
                  <p>• Edit existing work by clicking the <Edit2 className="w-4 h-4 inline" /> icon</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-100 border-l-2 border-blue-500 rounded mr-2"></div>
                    <span>Scheduled Work</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                    <span>Location</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-1" />
                    <span>Phone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium">Total Customers:</span>
              <span className="ml-2 text-blue-600 font-semibold">{scheduleData.length}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Total Work Days:</span>
              <span className="ml-2 text-green-600 font-semibold">
                {scheduleData.reduce((total, customer) => total + customer.dates?.length, 0)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Unique Dates:</span>
              <span className="ml-2 text-purple-600 font-semibold">
                {new Set(scheduleData.flatMap(customer => customer.dates))?.size}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkScheduleManager;