"use client";

import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Icon } from '@iconify/react';

// Common Indian/major cities with their coordinates to avoid calling geocoding API unnecessarily
const LOCAL_CITY_COORDINATES: { [key: string]: [number, number] } = {
  indore: [22.7196, 75.8577],
  bhopal: [23.2599, 77.4126],
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  patna: [25.5941, 85.1376],
  raipur: [21.2514, 81.6296],
  ranchi: [23.3441, 85.3096],
  dehradun: [30.3165, 78.0322],
  shimla: [31.1048, 77.1734],
  chandigarh: [30.7333, 76.7794],
  jammu: [32.7266, 74.8570],
  srinagar: [34.0837, 74.7973],
  guwahati: [26.1445, 91.7362],
  bhubaneswar: [20.2961, 85.8245],
  thiruvananthapuram: [8.5241, 76.9366],
  panaji: [15.4909, 73.8278],
  goa: [15.2993, 74.1240],
  gandhinagar: [23.2156, 72.6369],
  agartala: [23.8315, 91.2868],
  imphal: [24.8170, 93.9368],
  shillong: [25.5788, 91.8831],
  aizawl: [23.7271, 92.7176],
  kohima: [25.6751, 94.1086],
  itanagar: [27.0844, 93.6053],
  gangtok: [27.3314, 88.6138],
  noida: [28.5355, 77.3910],
  gurugram: [28.4595, 77.0266],
  gurgaon: [28.4595, 77.0266],
  faridabad: [28.4089, 77.3178],
  ghaziabad: [28.6692, 77.4538],
  mysore: [12.2958, 76.6394],
  coimbatore: [11.0168, 76.9558],
  kochi: [9.9312, 76.2673],
  cochin: [9.9312, 76.2673],
  madurai: [9.9252, 78.1198],
  surat: [21.1702, 72.8311],
  vadodara: [22.3072, 73.1812],
  baroda: [22.3072, 73.1812],
  rajkot: [22.3039, 70.8022],
  nagpur: [21.1458, 79.0882],
  thane: [19.2183, 72.9781],
  'navi mumbai': [19.0330, 73.0297],
  nashik: [19.9975, 73.7898],
  aurangabad: [19.8762, 75.3433],
  solapur: [17.6599, 75.9064],
  visakhapatnam: [17.6868, 83.2185],
  vijayawada: [16.5062, 80.6480],
  guntur: [16.3067, 80.4365],
  warangal: [17.9689, 79.5941],
  jabalpur: [23.1815, 79.9864],
  gwalior: [26.2183, 78.1828],
  ujjain: [23.1760, 75.7885],
  amritsar: [31.6340, 74.8723],
  ludhiana: [30.9010, 75.8573],
  jalandhar: [31.3260, 75.5762],
  patiala: [30.3398, 76.3869],
  haridwar: [29.9457, 78.1642],
  kanpur: [26.4499, 80.3319],
  varanasi: [25.3176, 82.9739],
  banaras: [25.3176, 82.9739],
  allahabad: [25.4358, 81.8463],
  prayagraj: [25.4358, 81.8463],
  agra: [27.1767, 78.0081],
  meerut: [28.9845, 77.7064],
  bareilly: [28.3640, 79.4150],
  aligarh: [27.8974, 78.0880],
  gorakhpur: [26.7606, 83.3731],
  jodhpur: [26.2389, 73.0243],
  udaipur: [24.5854, 73.7125],
  kota: [25.2138, 75.8648],
  bikaner: [28.0229, 73.3119],
  ajmer: [26.4498, 74.6399],
  jaisalmer: [26.9157, 70.9083],
};

// Dynamic Leaflet script and CSS loader
const loadLeaflet = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error("Cannot load Leaflet on server side."));
      return;
    }
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }

    // Add Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.id = "leaflet-css";
    document.head.appendChild(link);

    // Add Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.id = "leaflet-js";
    script.onload = () => {
      resolve((window as any).L);
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

interface Order {
  _id: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  items?: Array<{
    product: {
      _id: string;
      name: string;
    } | null;
    variant: {
      weight: string;
      price: number;
      sku: string;
    };
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  totalItems?: number;
  paymentMethod: string;
  paymentStatus: string;
  trackingId?: string;
  status: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  statusHistory?: Array<{
    status: string;
    updatedAt: string;
  }>;
  address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Detail Drawer States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailedOrder, setDetailedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [statusInput, setStatusInput] = useState<Order['status']>('PLACED');

  // Map DOM element ref and Leaflet Map instance ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    // Fetch minimal orders for list & map rendering
    fetch('/api/orders/minimal')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setOrders(json.data);
        } else {
          toast.error(json.message || "Failed to load orders.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  // Update form inputs when detailed order changes
  useEffect(() => {
    if (detailedOrder) {
      setTrackingIdInput(detailedOrder.trackingId || '');
      setStatusInput(detailedOrder.status);
    }
  }, [detailedOrder]);

  // Load detailed order on demand when selection changes
  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order);
    setDetailedOrder(order); // temporarily use minimal order data
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`);
      const json = await res.json();
      if (json.success) {
        setDetailedOrder(json.data);
      } else {
        toast.error(json.message || "Failed to fetch order details.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch order details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Geocoding client side with fallback
  const geocodeAddress = async (address: Order['address']): Promise<[number, number]> => {
    // Safety check for undefined address
    if (!address) {
      const randOffset = () => (Math.random() - 0.5) * 0.4;
      return [22.7196 + randOffset(), 75.8577 + randOffset()];
    }

    const cityKey = (address.city || "").toLowerCase().trim();
    if (LOCAL_CITY_COORDINATES[cityKey]) {
      return LOCAL_CITY_COORDINATES[cityKey];
    }

    const stateKey = (address.state || "").toLowerCase().trim();
    if (LOCAL_CITY_COORDINATES[stateKey]) {
      return LOCAL_CITY_COORDINATES[stateKey];
    }

    // Try Nominatim Geocoding with localstorage cache
    const cacheKey = `geo_${cityKey}_${stateKey}_${address.postalCode}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }

    try {
      const query = encodeURIComponent(`${address.city || ""}, ${address.state || ""}, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`, {
        headers: {
          'User-Agent': 'RamanGreenAdminPanel/1.0'
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        return coords;
      }
    } catch (err) {
      console.warn("Geocoding failed, falling back to default coordinate.", err);
    }

    // Default fallback to central India (Indore coordinates with a tiny random offset to avoid exact overlap)
    const randOffset = () => (Math.random() - 0.5) * 0.4;
    return [22.7196 + randOffset(), 75.8577 + randOffset()];
  };

  // Filter orders based on status tab and search query
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    const idStr = `#${order._id.slice(-6).toUpperCase()}`;
    const custName = (order.user?.name || 'Guest').toLowerCase();
    const custEmail = (order.user?.email || '').toLowerCase();
    const cityStr = (order.address?.city || '').toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      idStr.includes(searchLower) ||
      custName.includes(searchLower) ||
      custEmail.includes(searchLower) ||
      cityStr.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // Initialize Map
  useEffect(() => {
    if (viewMode !== 'map' || loading || !mapContainerRef.current) return;

    let mapInstance: any = null;
    let markers: any[] = [];

    const setupMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!mapContainerRef.current) return;

        // Initialize map centered at India's center [22.973, 78.656]
        mapInstance = L.map(mapContainerRef.current, {
          center: [22.973, 78.656],
          zoom: 5,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        leafletMapRef.current = mapInstance;

        // Plot filtered orders on the map
        const points: Array<[number, number]> = [];

        for (const order of filteredOrders) {
          const coords = await geocodeAddress(order.address);
          points.push(coords);

          // Customize marker HTML based on order status
          const markerColor =
            order.status === 'DELIVERED' ? 'bg-[#2e7d32]' :
            order.status === 'CANCELLED' ? 'bg-[#c62828]' :
            order.status === 'SHIPPED' ? 'bg-[#ef6c00]' :
            order.status === 'CONFIRMED' ? 'bg-[#1565c0]' :
            'bg-[#0288d1]';

          const markerHtml = `
            <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-white shadow-md transform hover:scale-110 transition-transform ${markerColor}" style="width: 32px; height: 32px; border-radius: 50%;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
            </div>
          `;

          const customIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-leaflet-marker-wrapper',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });

          const popupContent = document.createElement('div');
          popupContent.className = "p-2 space-y-2 font-inter max-w-[240px]";
          popupContent.innerHTML = `
            <div class="border-b border-gray-100 pb-1.5">
              <span class="text-[10px] font-black text-gray-400">ORDER ID</span>
              <p class="text-xs font-bold text-gray-800">#${order._id.slice(-6).toUpperCase()}</p>
            </div>
            <div class="space-y-0.5">
              <p class="text-xs text-gray-800"><span class="font-bold">Customer:</span> ${order.user?.name || 'Guest'}</p>
              <p class="text-xs text-gray-800"><span class="font-bold">Total:</span> ₹${order.totalPrice.toLocaleString()}</p>
              <p class="text-xs text-gray-800"><span class="font-bold">City:</span> ${order.address?.city || '-'}</p>
              <p class="text-xs mt-1"><span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white ${markerColor}">${order.status}</span></p>
            </div>
          `;

          // Add a custom button inside popup to trigger Details Drawer
          const btn = document.createElement('button');
          btn.className = "w-full mt-2.5 bg-forest hover:bg-forest/90 text-white text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer text-center";
          btn.textContent = "View Order Details";
          btn.onclick = () => {
            handleSelectOrder(order);
          };
          popupContent.appendChild(btn);

          const marker = L.marker(coords, { icon: customIcon })
            .addTo(mapInstance)
            .bindPopup(popupContent);

          markers.push(marker);
        }

        leafletMarkersRef.current = markers;

        // Auto pan map bounds to contain all points if points are available
        if (points.length > 0) {
          const bounds = L.latLngBounds(points);
          mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
        }
      } catch (err) {
        console.error("Failed to setup map:", err);
      }
    };

    setupMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      leafletMapRef.current = null;
    };
  }, [viewMode, filteredOrders.length, loading]);

  const handleUpdateOrder = async () => {
    if (!detailedOrder) return;
    setUpdatingStatus(true);

    try {
      const res = await fetch(`/api/orders/${detailedOrder._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusInput,
          trackingId: trackingIdInput
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Order updated successfully!");
        
        // Update minimal orders list state (status and trackingId changes)
        setOrders(prev => prev.map(o => o._id === detailedOrder._id ? { ...o, status: statusInput, trackingId: trackingIdInput } : o));
        
        // Reload detailed order details so statusHistory displays the newly updated transition
        const detailRes = await fetch(`/api/orders/${detailedOrder._id}`);
        const detailJson = await detailRes.json();
        if (detailJson.success) {
          setDetailedOrder(detailJson.data);
        }
      } else {
        toast.error(json.message || "Failed to update order.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'SHIPPED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Orders Management"
          description="Track status, filter, update details, and view store orders geographically."
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Orders' }
          ]}
        />
        {/* Toggle Switch */}
        <div className="bg-white p-1.5 rounded-xl border border-gray-200 flex items-center shadow-xs">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${viewMode === 'list' ? 'bg-forest text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Icon icon="solar:list-bold-duotone" className="w-4 h-4" />
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${viewMode === 'map' ? 'bg-forest text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Icon icon="solar:map-point-bold-duotone" className="w-4 h-4" />
            Map View
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { label: 'All Orders', value: 'ALL' },
              { label: 'Placed', value: 'PLACED' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Shipped', value: 'SHIPPED' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.value
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Icon icon="solar:magnifer-linear" className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search ID, customer, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-100 hover:border-gray-200 focus:bg-white focus:border-forest rounded-xl outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4.5">Order ID</th>
                  <th className="px-6 py-4.5">Date</th>
                  <th className="px-6 py-4.5">Customer</th>
                  <th className="px-6 py-4.5">Location</th>
                  <th className="px-6 py-4.5">Payment</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => handleSelectOrder(order)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-bold text-sm text-gray-900">
                      <span className="text-gray-400 group-hover:text-forest transition-colors">#</span>
                      {order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-800">{order.user?.name || 'Guest'}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">{order.user?.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                      {order.address?.city || '-'}, {order.address?.state || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{order.paymentMethod}</span>
                        <span className={`text-[9px] font-bold uppercase ${order.paymentStatus === 'SUCCESS' ? 'text-green-600' : 'text-amber-600'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-sm text-gray-900">
                      ₹{order.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-semibold text-sm">
                      <Icon icon="solar:box-minimalistic-linear" className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Map View container */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[600px] relative animate-in fade-in duration-300">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          
          {/* Floating map stats HUD */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-3.5 rounded-xl border border-gray-200/50 shadow-md text-xs font-semibold text-gray-700 pointer-events-none space-y-1">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Geographic View Summary</p>
            <p className="text-gray-800">Plotting <span className="font-extrabold text-forest">{filteredOrders.length}</span> orders on map</p>
          </div>
        </div>
      )}

      {/* Slide-over Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden font-inter animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={() => setSelectedOrder(null)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300 translate-x-0 relative">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ORDER DETAIL</span>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">#{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <Icon icon="lucide:x" className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* On-Demand Detail Loading Overlay */}
                {loadingDetail && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-forest"></div>
                    <span className="text-xs font-bold text-gray-500 mt-3">Loading full order details...</span>
                  </div>
                )}

                {/* Order Status & Actions Panel */}
                <div className="bg-[#FAF9F6] border border-gray-100 p-4.5 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Update Shipment</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status Select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
                      <select
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value as Order['status'])}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-forest"
                      >
                        <option value="PLACED">Placed</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    {/* Tracking ID */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Tracking ID</label>
                      <input
                        type="text"
                        value={trackingIdInput}
                        onChange={(e) => setTrackingIdInput(e.target.value)}
                        placeholder="e.g. IN94830184"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-forest"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateOrder}
                    disabled={updatingStatus}
                    className="w-full py-2 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {updatingStatus ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon="solar:disk-bold-duotone" className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>

                {/* Customer Details */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-1">Customer</h4>
                  <div className="text-xs space-y-1.5">
                    <p className="text-gray-800"><span className="font-bold text-gray-500">Name:</span> {detailedOrder?.user?.name || 'Guest Customer'}</p>
                    <p className="text-gray-800"><span className="font-bold text-gray-500">Email:</span> {detailedOrder?.user?.email || '-'}</p>
                    <p className="text-gray-800"><span className="font-bold text-gray-500">Phone:</span> {detailedOrder?.address?.phone || '-'}</p>
                  </div>
                </div>

                {/* Shipping Location */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-1">Shipping Address</h4>
                  <div className="text-xs leading-relaxed text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-bold text-gray-800 mb-1">{detailedOrder?.address?.fullName}</p>
                    <p>{detailedOrder?.address?.address}</p>
                    <p>{detailedOrder?.address?.city}, {detailedOrder?.address?.state} - <span className="font-mono">{detailedOrder?.address?.postalCode}</span></p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-1">Items List ({detailedOrder?.items?.length || 0})</h4>
                  <div className="divide-y divide-gray-100">
                    {detailedOrder?.items && detailedOrder.items.length > 0 ? (
                      detailedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between items-start text-xs first:pt-0 last:pb-0">
                          <div>
                            <p className="font-bold text-gray-800">{item.product?.name || "Organic Product"}</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              Variant: {item.variant?.weight || 'Default'} | SKU: <span className="font-mono">{item.variant?.sku || '-'}</span> | Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-extrabold text-gray-800 pl-4">₹{(item.price || item.variant?.price || 0) * item.quantity}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic py-2">No items listed or loading...</p>
                    )}
                  </div>
                </div>

                {/* Vertical Status History Timeline */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-1">Status Timeline History</h4>
                  <div className="relative pl-6 space-y-4.5 pt-1">
                    {/* Visual Line */}
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-100" />
                    
                    {(detailedOrder?.statusHistory && detailedOrder.statusHistory.length > 0
                      ? detailedOrder.statusHistory
                      : [{ status: 'PLACED', updatedAt: detailedOrder?.createdAt || new Date().toISOString() }]
                    ).map((historyItem: any, idx: number) => {
                      const badgeColor =
                        historyItem.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                        historyItem.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                        historyItem.status === 'SHIPPED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        historyItem.status === 'CONFIRMED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        'bg-sky-50 text-sky-700 border-sky-200';

                      return (
                        <div key={idx} className="relative flex flex-col items-start text-xs">
                          {/* Circle bullet */}
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-4 ring-forest/10 bg-forest" />
                          <div className="flex justify-between items-center w-full">
                            <span className={`font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                              {historyItem.status}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                              {new Date(historyItem.updatedAt).toLocaleString("en-US", {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                    <p>Payment Method</p>
                    <p className="uppercase tracking-wider font-bold">{detailedOrder?.paymentMethod}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                    <p>Payment Status</p>
                    <p className={`font-bold ${detailedOrder?.paymentStatus === 'SUCCESS' ? 'text-green-600' : 'text-amber-600'}`}>{detailedOrder?.paymentStatus}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-1 border-t border-dashed border-gray-100">
                    <p>Grand Total</p>
                    <p className="text-base text-forest font-extrabold">₹{detailedOrder?.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
