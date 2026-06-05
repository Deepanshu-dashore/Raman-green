"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import DeleteModal from '@/components/shared/DeleteModal';
import LabledInput from '@/components/shared/LabledInput';


const AdminSettings = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab');
    const subParam = searchParams.get('sub');

    const [configCategory, setConfigCategory] = useState('product');
    const [activeTab, setActiveTab] = useState('certificates');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, type: 'cert' | 'pack' | 'unit' | 'city' } | null>(null);

    // Update category and sub-tab if searchParams change
    useEffect(() => {
        if (tabParam === 'branding') setConfigCategory('branding');
        else if (tabParam === 'general') setConfigCategory('general');
        else if (tabParam === 'product' || subParam) setConfigCategory('product');

        if (subParam) setActiveTab(subParam);
    }, [tabParam, subParam]);

    // Data states
    const [certificates, setCertificates] = useState<any[]>([]);
    const [packaging, setPackaging] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateFilter, setSelectedStateFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Form states

    const [packForm, setPackForm] = useState({ name: '', type: 'Box', description: '' });
    const [unitForm, setUnitForm] = useState({ name: '', shortName: '' });
    const [cityForm, setCityForm] = useState({ name: '', state: '' });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);


    const fetchCertificates = async () => {
        try {
            const res = await fetch('/api/admin/certificates');
            const json = await res.json();
            if (json.success) setCertificates(json.data);
        } catch (error) { toast.error("Failed to load certificates"); }
    };

    const fetchPackaging = async () => {
        try {
            const res = await fetch('/api/admin/packaging');
            const json = await res.json();
            if (json.success) setPackaging(json.data);
        } catch (error) { toast.error("Failed to load packaging"); }
    };

    const fetchUnits = async () => {
        try {
            const res = await fetch('/api/admin/units');
            const json = await res.json();
            if (json.success) setUnits(json.data);
        } catch (error) { toast.error("Failed to load units"); }
    };

    const fetchCities = async (stateFilter?: string) => {
        try {
            const url = stateFilter ? `/api/admin/cities?state=${encodeURIComponent(stateFilter)}` : '/api/admin/cities';
            const res = await fetch(url);
            const json = await res.json();
            if (json.success) setCities(json.data);
        } catch (error) { toast.error("Failed to load cities"); }
    };

    const fetchStates = async () => {
        try {
            const res = await fetch('/api/admin/cities/states');
            const json = await res.json();
            if (json.success) setStates(json.data);
        } catch (error) { console.error("Failed to load states", error); }
    };

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'certificates' && configCategory === 'product') fetchCertificates().finally(() => setLoading(false));
        else if (activeTab === 'packaging' && configCategory === 'product') fetchPackaging().finally(() => setLoading(false));
        else if (activeTab === 'units' && configCategory === 'product') fetchUnits().finally(() => setLoading(false));
        else if (activeTab === 'cities' && configCategory === 'product') {
            Promise.all([fetchCities(selectedStateFilter), fetchStates()]).finally(() => setLoading(false));
        }
        else setLoading(false);
    }, [activeTab, configCategory, selectedStateFilter]);



    const handlePackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/admin/packaging/${editingId}` : '/api/admin/packaging';
            const method = editingId ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(packForm)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editingId ? "Packaging updated" : "Packaging added");
                setPackForm({ name: '', type: 'Box', description: '' });
                setEditingId(null);
                fetchPackaging();
            }
        } catch (error) { toast.error("An error occurred"); }
        finally { setIsSubmitting(false); }
    };

    const handleUnitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/admin/units/${editingId}` : '/api/admin/units';
            const method = editingId ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(unitForm)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editingId ? "Unit updated" : "Unit added");
                setUnitForm({ name: '', shortName: '' });
                setEditingId(null);
                fetchUnits();
            }
        } catch (error) { toast.error("An error occurred"); }
        finally { setIsSubmitting(false); }
    };

    const handleCitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/admin/cities/${editingId}` : '/api/admin/cities';
            const method = editingId ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cityForm)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editingId ? "City updated" : "City added");
                setCityForm({ name: '', state: '' });
                setEditingId(null);
                fetchCities(selectedStateFilter);
                fetchStates();
            }
        } catch (error) { toast.error("An error occurred"); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteClick = (item: any, type: 'cert' | 'pack' | 'unit' | 'city') => {
        setSelectedItem({
            id: item._id,
            name: item.name,
            type
        });
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return;
        const { id, type } = selectedItem;
        setDeleteModalOpen(false);
        try {
            let endpoint = '';
            if (type === 'cert') endpoint = `/api/admin/certificates/${id}`;
            else if (type === 'pack') endpoint = `/api/admin/packaging/${id}`;
            else if (type === 'unit') endpoint = `/api/admin/units/${id}`;
            else if (type === 'city') endpoint = `/api/admin/cities/${id}`;

            const res = await fetch(endpoint, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success("Deleted successfully");
                if (type === 'cert') fetchCertificates();
                else if (type === 'pack') fetchPackaging();
                else if (type === 'unit') fetchUnits();
                else if (type === 'city') {
                    fetchCities(selectedStateFilter);
                    fetchStates();
                }
            }
        } catch (error) { toast.error("Failed to delete"); }
        finally { setSelectedItem(null); }
    };

    const startEdit = (item: any, type: 'cert' | 'pack' | 'unit' | 'city') => {
        if (type === 'cert') {
            router.push(`/admin/settings/certificates/form?id=${item._id}`);
            return;
        }
        setEditingId(item._id);
        if (type === 'pack') setPackForm({ name: item.name, type: item.type, description: item.description || '' });
        else if (type === 'unit') setUnitForm({ name: item.name, shortName: item.shortName });
        else if (type === 'city') setCityForm({ name: item.name, state: item.state || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    let pageTitle = "Settings";
    let pageDesc = "Manage global configurations and product metadata.";

    if (configCategory === 'general') {
        pageTitle = "Global Settings";
        pageDesc = "General system configurations.";
    } else if (configCategory === 'branding') {
        pageTitle = "Storefront Branding";
        pageDesc = "Manage storefront appearance and themes.";
    } else if (configCategory === 'product') {
        if (activeTab === 'certificates') {
            pageTitle = "Certificates";
            pageDesc = "Manage trust markers to display on product pages.";
        } else if (activeTab === 'packaging') {
            pageTitle = "Packaging Types";
            pageDesc = "Define how your products are shipped.";
        } else if (activeTab === 'units') {
            pageTitle = "Measurement Units";
            pageDesc = "Define weight and size units (e.g., Gram, KG).";
        } else if (activeTab === 'cities') {
            pageTitle = "Cities";
            pageDesc = "Manage cultivation or operational cities.";
        } else if (activeTab === 'tags') {
            pageTitle = "Product Tags";
            pageDesc = "Manage your product tags.";
        } else if (activeTab === 'brands') {
            pageTitle = "Brands";
            pageDesc = "Manage your product brands.";
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <PageHeader
                title={pageTitle}
                description={pageDesc}
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Settings', href: '/admin/settings' },
                    { label: pageTitle }
                ]}
                actionNode={configCategory === 'product' ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeTab === 'certificates' ? 'edit' : 'outline'}
                            icon="lucide:award"
                            onClick={() => setActiveTab('certificates')}
                            size="sm"
                        >
                            Certificates
                        </Button>
                        <Button
                            variant={activeTab === 'packaging' ? 'edit' : 'outline'}
                            icon="lucide:package"
                            onClick={() => setActiveTab('packaging')}
                            size="sm"
                        >
                            Packaging
                        </Button>
                        <Button
                            variant={activeTab === 'units' ? 'edit' : 'outline'}
                            icon="lucide:scale"
                            onClick={() => setActiveTab('units')}
                            size="sm"
                        >
                            Units
                        </Button>
                        <Button
                            variant={activeTab === 'cities' ? 'edit' : 'outline'}
                            icon="lucide:map-pin"
                            onClick={() => setActiveTab('cities')}
                            size="sm"
                        >
                            Cities
                        </Button>
                    </div>
                ) : null}
            />

            {configCategory === 'product' && (
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'certificates' && (
                        <div className="grid grid-cols-1 gap-8">
                            <Card className="overflow-hidden !p-0">
                                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">Product Certificates</h3>
                                        <p className="text-sm text-gray-500">Manage trust markers to display on product pages.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="edit"
                                            icon="lucide:plus"
                                            onClick={() => router.push('/admin/settings/certificates/form')}
                                        >
                                            New Certificate
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <DataTable
                                        data={certificates}
                                        loading={loading}
                                        rowKey={(row: any) => row._id}
                                        columns={[
                                            {
                                                key: 'preview',
                                                label: 'Preview',
                                                custom: true,
                                                render: (row: any) => (
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-1 flex-shrink-0">
                                                        <img src={row.url} alt="" className="w-full h-full object-contain" onError={(e: any) => e.target.src = 'https://placehold.co/100?text=Error'} />
                                                    </div>
                                                )
                                            },
                                            { key: 'name', label: 'Name', type: 'text', sortable: true }
                                        ]}
                                        onEdit={(row: any) => startEdit(row, 'cert')}
                                        onDelete={(row: any) => handleDeleteClick(row, 'cert')}
                                        hiddenActions={['view']}
                                        searchPlaceholder="Search certificates..."
                                    />
                                </div>
                            </Card>

                        </div>
                    )}

                    {activeTab === 'packaging' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 overflow-hidden !p-0">
                                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">Packaging Types</h3>
                                        <p className="text-sm text-gray-500">Define how your products are shipped.</p>
                                    </div>
                                    {/* <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600 border border-gray-50">
                                        <Icon icon="lucide:package" className="w-6 h-6" />
                                    </div> */}
                                </div>
                                <div className="p-4">
                                    <DataTable
                                        data={packaging}
                                        loading={loading}
                                        rowKey={(row: any) => row._id}
                                        columns={[
                                            {
                                                key: 'type',
                                                label: 'Type',
                                                custom: true,
                                                render: (row: any) => (
                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-100">{row.type}</span>
                                                )
                                            },
                                            { key: 'name', label: 'Name', type: 'text', sortable: true }
                                        ]}
                                        onEdit={(row: any) => startEdit(row, 'pack')}
                                        onDelete={(row: any) => handleDeleteClick(row, 'pack')}
                                        hiddenActions={['view']}
                                        searchPlaceholder="Search packaging..."
                                    />
                                </div>
                            </Card>
                            {/* Form */}
                            <Card className="h-fit sticky top-24">
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                    <Icon icon={editingId ? "lucide:edit-3" : "lucide:plus-circle"} className={editingId ? "text-blue-500" : "text-orange-500"} />
                                    {editingId ? 'Edit Type' : 'New Packaging'}
                                </h3>
                                <form onSubmit={handlePackSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                                        <select value={packForm.type} onChange={(e) => setPackForm({ ...packForm, type: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm cursor-pointer appearance-none">
                                            <option value="Box">Box</option>
                                            <option value="Bottle">Bottle</option>
                                            <option value="Pouch">Pouch</option>
                                            <option value="Jar">Jar</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <LabledInput value={packForm.name} onChange={(e) => setPackForm({ ...packForm, name: e.target.value })} required label='Name' placeholder="e.g. Glass Bottle (250ml)" />
                                    </div>
                                    <div>
                                        <LabledInput value={packForm.description} onChange={(e) => setPackForm({ ...packForm, description: e.target.value })} label='Notes (Optional)' placeholder="Brief info..." />
                                    </div>
                                    <Button type="submit" variant="edit" fullWidth isLoading={isSubmitting} className="!py-2.5 !px-6 !rounded-lg text-xs font-bold mt-2" icon="lucide:save">
                                        {editingId ? 'Update' : 'Add'}
                                    </Button>
                                    {editingId && <button type="button" onClick={() => { setEditingId(null); setPackForm({ name: '', type: 'Box', description: '' }); }} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel Edit</button>}
                                </form>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'units' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 overflow-hidden !p-0">
                                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">Measurement Units</h3>
                                        <p className="text-sm text-gray-500">Weight and size units for product variants.</p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <DataTable
                                        data={units}
                                        loading={loading}
                                        rowKey={(row: any) => row._id}
                                        columns={[
                                            {
                                                key: 'shortName',
                                                label: 'Short Name',
                                                custom: true,
                                                render: (row: any) => (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">{row.shortName}</span>
                                                )
                                            },
                                            { key: 'name', label: 'Full Name', type: 'text', sortable: true }
                                        ]}
                                        onEdit={(row: any) => startEdit(row, 'unit')}
                                        onDelete={(row: any) => handleDeleteClick(row, 'unit')}
                                        hiddenActions={['view']}
                                        searchPlaceholder="Search units..."
                                    />
                                </div>
                            </Card>
                            {/* Form */}
                            <Card className="h-fit sticky top-24">
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                    <Icon icon={editingId ? "lucide:edit-3" : "lucide:plus-circle"} className={editingId ? "text-blue-500" : "text-blue-500"} />
                                    {editingId ? 'Edit Unit' : 'New Unit'}
                                </h3>
                                <form onSubmit={handleUnitSubmit} className="space-y-5">
                                    <div>
                                        <LabledInput label="Full Name" value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} required placeholder="e.g. Kilogram" />
                                    </div>
                                    <div>
                                        <LabledInput label="Short Name" value={unitForm.shortName} onChange={(e) => setUnitForm({ ...unitForm, shortName: e.target.value })} required placeholder="e.g. kg" />
                                    </div>
                                    <Button type="submit" variant="edit" fullWidth isLoading={isSubmitting} className="!py-2.5 !px-6 !rounded-lg text-xs font-bold mt-2" icon="lucide:save">
                                        {editingId ? 'Update' : 'Add'}
                                    </Button>
                                    {editingId && <button type="button" onClick={() => { setEditingId(null); setUnitForm({ name: '', shortName: '' }); }} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel Edit</button>}
                                </form>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'cities' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 overflow-hidden !p-0">
                                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">Cities</h3>
                                        <p className="text-sm text-gray-500">Manage cultivation or operational cities.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">State:</label>
                                        <select
                                            value={selectedStateFilter}
                                            onChange={(e) => setSelectedStateFilter(e.target.value)}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-xs cursor-pointer appearance-none min-w-[150px]"
                                        >
                                            <option value="">All States</option>
                                            {states.map((st) => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <DataTable
                                        data={cities}
                                        loading={loading}
                                        rowKey={(row: any) => row._id}
                                        columns={[
                                            { key: 'name', label: 'City Name', type: 'text', sortable: true },
                                            { key: 'state', label: 'State / Region', type: 'text', sortable: true }
                                        ]}
                                        onEdit={(row: any) => startEdit(row, 'city')}
                                        onDelete={(row: any) => handleDeleteClick(row, 'city')}
                                        hiddenActions={['view']}
                                        searchPlaceholder="Search cities..."
                                    />
                                </div>
                            </Card>
                            {/* Form */}
                            <Card className="h-fit sticky top-24">
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                    <Icon icon={editingId ? "lucide:edit-3" : "lucide:plus-circle"} className={editingId ? "text-blue-500" : "text-green-500"} />
                                    {editingId ? 'Edit City' : 'New City'}
                                </h3>
                                <form onSubmit={handleCitySubmit} className="space-y-5">
                                    <div>
                                        <LabledInput label="City Name" value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} required placeholder="e.g. Indore" />
                                    </div>
                                    <div>
                                        <LabledInput label="State / Region (Optional)" value={cityForm.state} onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })} placeholder="e.g. Madhya Pradesh" />
                                    </div>
                                    <Button type="submit" variant="edit" fullWidth isLoading={isSubmitting} className="!py-2.5 !px-6 !rounded-lg text-xs font-bold mt-2" icon="lucide:save">
                                        {editingId ? 'Update' : 'Add'}
                                    </Button>
                                    {editingId && <button type="button" onClick={() => { setEditingId(null); setCityForm({ name: '', state: '' }); }} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel Edit</button>}
                                </form>
                            </Card>
                        </div>
                    )}

                    {(activeTab === 'tags' || activeTab === 'brands') && (
                        <Card className="!p-20 text-center">
                            <Icon icon="lucide:sparkles" className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h4>
                            <p className="text-gray-400 max-w-sm mx-auto">This section is currently under development. You will soon be able to manage your product {activeTab} here.</p>
                        </Card>
                    )}
                </div>
            )}

            {configCategory !== 'product' && (
                <Card className="!p-20 text-center">
                    <Icon icon={configCategory === 'branding' ? "lucide:palette" : "lucide:construction"} className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{configCategory.charAt(0).toUpperCase() + configCategory.slice(1)} Settings</h4>
                    <p className="text-gray-400 max-w-sm mx-auto">{configCategory === 'branding' ? 'Storefront appearance and themes' : 'General system configurations'} will be available here in the next update.</p>
                </Card>
            )}

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedItem(null);
                }}
                onConfirm={handleDeleteConfirm}
                title={`Delete ${selectedItem?.type === 'cert' ? 'Certificate' : selectedItem?.type === 'pack' ? 'Packaging Type' : selectedItem?.type === 'unit' ? 'Measurement Unit' : 'City'}`}
                message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
                confirmButtonText="Delete"
            />
        </div>
    );
};

export default AdminSettings;
