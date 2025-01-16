import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, X, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MessageReplyModal } from './MessageReplyModal';

interface DataTableProps {
  tableName: string;
  onChangesPending?: (pending: boolean) => void;
}

// Hidden columns configuration
const HIDDEN_COLUMNS = {
  companies: ['id', 'created_at', 'updated_at'],
  experiences: ['id', 'created_at', 'updated_at', 'company_id', 'order_index'],
  education: ['id', 'created_at', 'updated_at', 'institution_id', 'order_index'],
  certifications: ['id', 'created_at', 'updated_at', 'order_index'],
  skills: ['id', 'created_at', 'updated_at', 'order_index'],
  achievements: ['id', 'created_at', 'updated_at', 'company_id', 'order_index'],
  contacts: ['id', 'created_at', 'updated_at'],
  about_me: ['id', 'created_at', 'updated_at', 'order_index'],
  expertise_areas: ['id', 'created_at', 'updated_at', 'order_index']
};

// Column width configuration
const COLUMN_WIDTHS = {
  title: 'w-1/4',
  description: 'w-1/2',
  name: 'w-1/4',
  email: 'w-1/4',
  message: 'w-1/2',
  role: 'w-1/4',
  degree: 'w-1/4',
  field_of_study: 'w-1/4',
  highlights: 'w-1/2',
  achievements: 'w-1/2'
};

export const DataTable: React.FC<DataTableProps> = ({ tableName, onChangesPending }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newData, setNewData] = useState<any>({});
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // Get visible columns by filtering out hidden ones
  const visibleColumns = data.length > 0
    ? Object.keys(data[0]).filter(key => !(HIDDEN_COLUMNS[tableName] || []).includes(key))
    : [];

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (value.name) return value.name;
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const getInputType = (column: string, value: any): string => {
    if (column.includes('date')) return 'date';
    if (column.includes('url')) return 'url';
    if (column.includes('email')) return 'email';
    if (typeof value === 'boolean') return 'checkbox';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    return 'text';
  };

  const handleMoveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = data.findIndex(item => item.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= data.length) return;
    
    const currentItem = data[currentIndex];
    const swapItem = data[newIndex];
    
    try {
      const { error: error1 } = await supabase
        .from(tableName)
        .update({ order_index: swapItem.order_index })
        .eq('id', currentItem.id);

      const { error: error2 } = await supabase
        .from(tableName)
        .update({ order_index: currentItem.order_index })
        .eq('id', swapItem.id);

      if (error1 || error2) throw error1 || error2;

      // Update local state
      const newData = [...data];
      newData[currentIndex] = { ...swapItem };
      newData[newIndex] = { ...currentItem };
      setData(newData);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleReply = (contact: any) => {
    setSelectedContact(contact);
  };

  useEffect(() => {
    fetchData();
    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, payload => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).select('*');
      
      // Add specific ordering based on table
      if (['experiences', 'education', 'expertise_areas', 'skills', 'certifications'].includes(tableName)) {
        query = query.order('order_index', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditedData({ ...item });
    onChangesPending?.(true);
  };

  const handleSave = async () => {
    try {
      // Process arrays before saving
      const processedData = { ...editedData };
      Object.keys(processedData).forEach(key => {
        const type = getInputType(key, data[0]?.[key]);
        if (type === 'array' && typeof processedData[key] === 'string') {
          processedData[key] = processedData[key].split(',').map(item => item.trim());
        }
      });

      const { error } = await supabase
        .from(tableName)
        .update(processedData)
        .eq('id', editingId);

      if (error) throw error;

      setData(data.map(item => 
        item.id === editingId ? processedData : item
      ));
      setEditingId(null);
      setEditedData(null);
      onChangesPending?.(false);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleAdd = async () => {
    try {
      // Process arrays before saving
      const processedData = { ...newData };
      Object.keys(processedData).forEach(key => {
        const type = getInputType(key, data[0]?.[key]);
        if (type === 'array' && typeof processedData[key] === 'string') {
          processedData[key] = processedData[key].split(',').map(item => item.trim());
        }
      });

      // Add order_index for sortable tables
      if (['experiences', 'education', 'expertise_areas', 'skills', 'certifications'].includes(tableName)) {
        processedData.order_index = (data.length > 0 ? Math.max(...data.map(item => item.order_index)) : 0) + 1;
      }

      const { data: newRecord, error } = await supabase
        .from(tableName)
        .insert([processedData])
        .select();

      if (error) throw error;

      setData([newRecord[0], ...data]);
      setShowAddForm(false);
      setNewData({});
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(data.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 md:p-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-emerald dark:text-sage capitalize">
          {tableName.replace(/_/g, ' ')}
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald text-white rounded-lg
                   hover:bg-emerald-700 transition-colors duration-300 text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-emerald/20 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {visibleColumns.map(column => {
              const type = getInputType(column, data[0]?.[column]);
              return (
                <div key={column} className={`${COLUMN_WIDTHS[column] || ''}`}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  {type === 'array' ? (
                    <textarea
                      value={newData[column] || ''}
                      onChange={(e) => setNewData({ ...newData, [column]: e.target.value })}
                      placeholder="Enter values separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                               focus:ring-emerald focus:border-emerald
                               dark:bg-dark-bg dark:text-white text-sm"
                      rows={3}
                    />
                  ) : type === 'checkbox' ? (
                    <select
                      value={newData[column] || ''}
                      onChange={(e) => setNewData({ ...newData, [column]: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                               focus:ring-emerald focus:border-emerald
                               dark:bg-dark-bg dark:text-white text-sm"
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={newData[column] || ''}
                      onChange={(e) => setNewData({ ...newData, [column]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                               focus:ring-emerald focus:border-emerald
                               dark:bg-dark-bg dark:text-white text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800
                       dark:hover:text-white transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 text-sm bg-emerald text-white rounded-lg hover:bg-emerald-700
                       transition-colors duration-300"
            >
              Add Record
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 md:-mx-6">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                {visibleColumns.map(column => (
                  <th
                    key={column}
                    className={`px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400
                             uppercase tracking-wider whitespace-nowrap ${COLUMN_WIDTHS[column] || ''}`}
                  >
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </th>
                ))}
                <th className="px-3 py-2 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {visibleColumns.map(column => {
                    const type = getInputType(column, item[column]);
                    return (
                      <td
                        key={column}
                        className={`px-3 py-2 text-sm text-gray-900 dark:text-gray-300 
                                ${COLUMN_WIDTHS[column] || ''}`}
                      >
                        {editingId === item.id ? (
                          type === 'array' ? (
                            <textarea
                              value={editedData[column] || ''}
                              onChange={(e) => setEditedData({
                                ...editedData,
                                [column]: e.target.value
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700
                                       rounded focus:ring-emerald focus:border-emerald
                                       dark:bg-dark-bg dark:text-white"
                              rows={3}
                            />
                          ) : type === 'checkbox' ? (
                            <select
                              value={String(editedData[column])}
                              onChange={(e) => setEditedData({
                                ...editedData,
                                [column]: e.target.value === 'true'
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700
                                       rounded focus:ring-emerald focus:border-emerald
                                       dark:bg-dark-bg dark:text-white"
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <input
                              type={type}
                              value={editedData[column] || ''}
                              onChange={(e) => setEditedData({
                                ...editedData,
                                [column]: e.target.value
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700
                                       rounded focus:ring-emerald focus:border-emerald
                                       dark:bg-dark-bg dark:text-white"
                            />
                          )
                        ) : (
                          <div className="truncate max-w-xs md:max-w-md lg:max-w-lg">
                            {formatValue(item[column])}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="p-1 text-emerald hover:text-emerald-700"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditedData(null);
                              onChangesPending?.(false);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-emerald hover:text-emerald-700"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {tableName === 'contacts' && (
                            <button
                              onClick={() => handleReply(item)}
                              className="p-1 text-emerald hover:text-emerald-700"
                              title="Reply"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                          {(tableName === 'experiences' || 
                            tableName === 'education' || 
                            tableName === 'expertise_areas' ||
                            tableName === 'skills' ||
                            tableName === 'certifications') && (
                            <>
                              <button
                                onClick={() => handleMoveItem(item.id, 'up')}
                                disabled={index === 0}
                                className={`p-1 text-emerald hover:text-emerald-700 ${
                                  index === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Move Up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveItem(item.id, 'down')}
                                disabled={index === data.length - 1}
                                className={`p-1 text-emerald hover:text-emerald-700 ${
                                  index === data.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Move Down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedContact && (
        <MessageReplyModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onSend={() => {
            fetchData();
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
};