"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  actionNode?: React.ReactNode;
  backLink?: string | number;
}

export function PageHeader({ title, description, breadcrumbs, actionNode, backLink }: PageHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 w-full mb-8">
      {/* Main Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight capitalize">{title}</h1>
          
          <nav className="flex items-center gap-5 text-[14px] font-normal">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={idx} className="flex capitalize items-center gap-2.5">
                  {crumb.href && !isLast ? (
                    <Link 
                      href={crumb.href} 
                      className="text-gray-900 hover:text-primary transition-colors hover:underline hover:underline-gray-800 underline-offset-1 decoration-1"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-gray-400 cursor-default" : "text-gray-900"}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <span className="text-slate-400 font-black">•</span>}
                </div>
              );
            })}
          </nav>
          {/* {description && (
            <p className="text-gray-500 mt-1 text-sm">{description}</p>
          )} */}
        </div>
        
        {/* Action Button Node */}
        <div className="flex items-center gap-2">
        {actionNode && (
             actionNode
            )}
        {backLink && (
          <div className="flex">
            {typeof backLink === "number" || backLink === "back" ? (
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 hover:bg-gray-200/80 text-gray-800 text-sm font-semibold rounded-lg transition-colors border border-gray-100"
              >
                <ChevronLeftIcon className="w-3 h-3 text-gray-600 stroke-[3.5px]" />
                Back
              </button>
            ) : (
              <Link 
                href={backLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 hover:bg-gray-200/80 text-gray-800 text-sm font-semibold rounded-lg transition-colors border border-gray-100"
              >
                <ChevronLeftIcon className="w-3 h-3 text-gray-600 stroke-[3.5px]" />
                Back
              </Link>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
