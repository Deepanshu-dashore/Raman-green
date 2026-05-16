"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

const CertificateFormPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [certForm, setCertForm] = useState({ 
        name: '', 
        url: '', 
        issueDate: '', 
        validTill: '', 
        issueFor: '', 
        certificateNumber: '', 
        issuedBy: '', 
        description: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            fetch(`/api/admin/certificates`)
                .then(res => res.json())
                .then(json => {
                    if (json.success) {
                        const cert = json.data.find((c: any) => c._id === id);
                        if (cert) {
                            setCertForm({
                                name: cert.name || '',
                                url: cert.url || '',
                                issueDate: cert.issueDate || '',
                                validTill: cert.validTill || '',
                                issueFor: cert.issueFor || '',
                                certificateNumber: cert.certificateNumber || '',
                                issuedBy: cert.issuedBy || '',
                                description: cert.description || ''
                            });
                        }
                    }
                    setIsLoading(false);
                })
                .catch(() => {
                    toast.error("Failed to load certificate");
                    setIsLoading(false);
                });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = id ? `/api/admin/certificates/${id}` : '/api/admin/certificates';
            const method = id ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certForm)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(id ? "Certificate updated" : "Certificate added");
                router.push('/admin/settings?tab=product&sub=certificates');
            } else {
                toast.error(json.message || "Failed to save certificate");
            }
        } catch (error) { 
            toast.error("An error occurred"); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center text-gray-500">Loading certificate details...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title={id ? "Edit Certificate" : "New Certificate"}
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Settings', href: '/admin/settings?tab=product&sub=certificates' },
                    { label: id ? "Edit" : "New" }
                ]}
                backLink="/admin/settings?tab=product&sub=certificates"
            />

            <Card className="!p-8 border-gray-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                            <input type="text" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} required className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm" placeholder="e.g. 100% Organic" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Icon/Image URL</label>
                            <input type="text" value={certForm.url} onChange={(e) => setCertForm({ ...certForm, url: e.target.value })} required className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm" placeholder="https://..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Date</label>
                            <input type="date" value={certForm.issueDate} onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Valid Till</label>
                            <input type="date" value={certForm.validTill} onChange={(e) => setCertForm({ ...certForm, validTill: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue For</label>
                            <input type="text" value={certForm.issueFor} onChange={(e) => setCertForm({ ...certForm, issueFor: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm" placeholder="e.g. Raman Green Product" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Certificate Number</label>
                            <input type="text" value={certForm.certificateNumber} onChange={(e) => setCertForm({ ...certForm, certificateNumber: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm" placeholder="e.g. CERT-12345" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issued By</label>
                        <input type="text" value={certForm.issuedBy} onChange={(e) => setCertForm({ ...certForm, issuedBy: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm" placeholder="e.g. FDA" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea value={certForm.description} onChange={(e) => setCertForm({ ...certForm, description: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm min-h-[120px]" placeholder="Certificate details..."></textarea>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.push('/admin/settings?tab=product&sub=certificates')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="edit" isLoading={isSubmitting} icon="lucide:save">
                            {id ? 'Update Certificate' : 'Save Certificate'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CertificateFormPage;
