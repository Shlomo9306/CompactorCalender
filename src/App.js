import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calendar, MapPin, Phone, FileText, ChevronLeft, ChevronRight, Table, Grid } from 'lucide-react';

const WorkScheduleManager = () => {
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  
  const [scheduleData, setScheduleData] = useState([
    {
      id: 1,
      name: "Bnos Sanz (Budd Rd)",
      address: "14 Budd Rd. Woodburne, NY, 12788",
      phone: "845-304-4252",
      dates: ["2025-06-30", "2025-07-07", "2025-07-14", "2025-07-21", "2025-07-28", "2025-08-04", "2025-08-11", "2025-08-18", "2025-08-25"],
      notes: "Every Monday"
    },
    {
      id: 2,
      name: "Camp Aguda",
      address: "140 upper Ferndale Road Ferndale 12734",
      phone: "917-697-4263",
      dates: ["2025-07-07", "2025-07-14", "2025-07-21", "2025-07-28", "2025-08-04", "2025-08-11", "2025-08-18", "2025-08-25"],
      notes: "Mon & Fri till Aug 25"
    },
    {
      id: 3,
      name: "Camp Aguda (Fri)",
      address: "140 Upper Ferndale Road Ferndale 12734",
      phone: "917-697-4263",
      dates: ["2025-07-03", "2025-07-11", "2025-07-18", "2025-07-25", "2025-08-01", "2025-08-08", "2025-08-15", "2025-08-22"],
      notes: "Friday schedule"
    },
    {
      id: 4,
      name: "Camp Aguda Bnos",
      address: "344 Ferndale Loomis Road Liberty 12754",
      phone: "646-704-3562",
      dates: ["2025-07-03", "2025-07-11", "2025-07-18", "2025-07-25", "2025-08-04", "2025-08-11", "2025-08-18", "2025-08-25"],
      notes: "Friday schedule"
    },
    {
      id: 5,
      name: "Landaus",
      address: "3 Railroad Plaza Ext South Fallsburg 12779",
      phone: "347-865-0486",
      dates: ["2025-06-23", "2025-06-30", "2025-07-07", "2025-07-14", "2025-07-21", "2025-07-28", "2025-08-04", "2025-08-11", "2025-08-18", "2025-08-25", "2025-09-02"],
      notes: "Every Monday morning"
    }
  ]);

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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Calendar-specific code
  const eventsMap = useMemo(() => {
    const map = new Map();
    scheduleData.forEach(customer => {
      customer.dates.forEach(dateStr => {
        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    resetForm();
    setShowAddForm(true);
    setShowQuickAdd(false);
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
    setShowQuickAdd(false);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setScheduleData(prev => prev.filter(customer => customer.id !== id));
    }
  };

  const handleDeleteWorkFromCalendar = (id, dateKey) => {
    setScheduleData(prev => {
      return prev.map(customer => {
        if (customer.id === id) {
          return {
            ...customer,
            dates: customer.dates.filter(d => d !== dateKey)
          };
        }
        return customer;
      }).filter(customer => customer.dates.length > 0); // Remove customers with no dates left
    });
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
    if (dateInput && !formData.dates.includes(dateInput)) {
      setFormData(prev => ({
        ...prev,
        dates: [...prev.dates, dateInput].sort()
      }));
      setDateInput('');
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

  // Calendar functions
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

  const navigateToMonthYear = (month, year) => {
    setCurrentDate(new Date(year, month, 1));
    setShowMonthPicker(false);
  };

  const openQuickAdd = (dateKey) => {
    setSelectedDate(dateKey);
    setFormData({
      name: '',
      address: '',
      phone: '',
      dates: [dateKey],
      notes: ''
    });
    setShowQuickAdd(true);
    setShowAddForm(false);
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

  const renderMonthYearPicker = () => {
    const currentYear = currentDate.getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {years.map(year => (
            <button
              key={year}
              onClick={() => navigateToMonthYear(currentDate.getMonth(), year)}
              className={`p-2 rounded ${currentYear === year ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => navigateToMonthYear(index, currentYear)}
              className={`p-2 rounded ${currentDate.getMonth() === index ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {month.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-40 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCustomer(event);
                    }}
                    className="p-1 rounded hover:bg-blue-200 text-blue-700"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkFromCalendar(event.id, event.date);
                    }}
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Work Schedule Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
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
            
            <button
              onClick={handleAddCustomer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Calendar View Header (only shown in calendar view) */}
        {currentView === 'calendar' && (
          <div className="flex items-center justify-center space-x-4 mb-6 relative">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="text-xl font-semibold text-gray-700 min-w-48 text-center hover:bg-gray-100 p-2 rounded-lg"
            >
              {formatMonthYear(currentDate)}
            </button>
            {showMonthPicker && renderMonthYearPicker()}
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Today's Schedule (only shown in calendar view) */}
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

        {/* Add/Edit Form */}
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
                    onChange={(e) => setDateInput(e.target.value)}
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

        {/* Main Content Area */}
        {currentView === 'table' ? (
          // Table View
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
                          {customer.dates.map((date, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs whitespace-nowrap"
                            >
                              {formatDate(date)}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {customer.dates.length} scheduled days
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
          // Calendar View  
          <div>
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {/* Day headers */}
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="bg-gray-100 p-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
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

        {/* Summary */}
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
                {scheduleData.reduce((total, customer) => total + customer.dates.length, 0)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Unique Dates:</span>
              <span className="ml-2 text-purple-600 font-semibold">
                {new Set(scheduleData.flatMap(customer => customer.dates)).size}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkScheduleManager;