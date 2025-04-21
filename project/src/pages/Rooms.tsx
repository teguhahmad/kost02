import React, { useState } from 'react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../ui/Button';
import RoomForm from '../components/rooms/RoomForm';
import { Room, Tenant } from '../types';
import { rooms as initialRooms, tenants as initialTenants } from '../data/mockData';
import { formatCurrency, getRoomStatusColor } from '../utils/formatters';
import { Plus, Search } from 'lucide-react';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [tenants, setTenants] = useState(initialTenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchQuery) || 
                         room.floor.includes(searchQuery);
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && room.status === filter;
  });

  const handleAddRoom = () => {
    setEditingRoom(undefined);
    setShowRoomForm(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  const handleRoomFormSubmit = (data: Partial<Room>) => {
    if (editingRoom) {
      setRooms(rooms.map(room => 
        room.id === editingRoom.id ? { ...room, ...data } : room
      ));
    } else {
      const newRoom: Room = {
        id: Math.random().toString(36).substr(2, 9),
        ...data as Omit<Room, 'id'>
      };
      setRooms([...rooms, newRoom]);
    }
    setShowRoomForm(false);
  };

  const handleViewTenant = (room: Room) => {
    if (room.tenantId) {
      const tenant = tenants.find(t => t.id === room.tenantId);
      if (tenant) {
        window.location.href = `/tenants?id=${tenant.id}`;
      }
    }
  };

  const handleAssignTenant = (room: Room) => {
    setSelectedRoom(room);
    setShowTenantSelector(true);
  };

  const handleTenantSelection = (tenantId: string) => {
    if (selectedRoom) {
      setRooms(rooms.map(room => 
        room.id === selectedRoom.id 
          ? { ...room, status: 'occupied', tenantId }
          : room
      ));

      setTenants(tenants.map(tenant =>
        tenant.id === tenantId
          ? { ...tenant, roomId: selectedRoom.id }
          : tenant
      ));
    }
    setShowTenantSelector(false);
    setSelectedRoom(undefined);
  };

  const availableTenants = tenants.filter(tenant => 
    tenant.status === 'active' && !tenant.roomId
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kamar</h1>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Manajemen Kamar</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <Button icon={<Plus size={16} />} onClick={handleAddRoom}>
              Tambah Kamar
            </Button>
          </div>
        </CardHeader>

        <div className="px-6 pb-2 flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('all')}
          >
            Semua
          </Button>
          <Button 
            variant={filter === 'occupied' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('occupied')}
          >
            Terisi
          </Button>
          <Button 
            variant={filter === 'vacant' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('vacant')}
          >
            Kosong
          </Button>
          <Button 
            variant={filter === 'maintenance' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('maintenance')}
          >
            Perbaikan
          </Button>
        </div>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <div 
                key={room.id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className={`h-2 ${
                    room.status === 'occupied' 
                      ? 'bg-blue-500' 
                      : room.status === 'vacant' 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                  }`}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">Kamar {room.number}</h3>
                      <p className="text-sm text-gray-500">Lantai {room.floor}</p>
                    </div>
                    <Badge className={getRoomStatusColor(room.status)}>
                      {room.status === 'occupied' ? 'Terisi' : 
                       room.status === 'vacant' ? 'Kosong' : 'Perbaikan'}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-600">Tipe {room.type.charAt(0).toUpperCase() + room.type.slice(1)}</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(room.price)}/bulan</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {room.facilities.map((facility, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {facility}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                      Ubah
                    </Button>
                    <Button 
                      variant={room.status === 'occupied' ? 'secondary' : 'primary'} 
                      size="sm"
                      onClick={() => room.status === 'occupied' ? handleViewTenant(room) : handleAssignTenant(room)}
                      disabled={room.status === 'maintenance'}
                    >
                      {room.status === 'occupied' ? 'Lihat Penyewa' : 'Pilih Penyewa'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showRoomForm && (
        <RoomForm
          room={editingRoom}
          onSubmit={handleRoomFormSubmit}
          onClose={() => setShowRoomForm(false)}
        />
      )}

      {showTenantSelector && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Pilih Penyewa</h2>
            {availableTenants.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableTenants.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSelection(tenant.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-sm text-gray-500">{tenant.email}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada penyewa yang tersedia.</p>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => {
                setShowTenantSelector(false);
                setSelectedRoom(undefined);
              }}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;