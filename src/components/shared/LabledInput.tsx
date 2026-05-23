export default function LabledInput({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    disabled = false,
    className = "",
    required = false,
}: {
    label: string;
    value: string | number;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}) {
    const sharedClasses = "w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-semibold text-sm transition-all";
    return (
        <div className={`space-y-1 ${className}`}>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
            {type === "textarea" ? (
                <textarea
                    value={value as string}
                    onChange={onChange as any}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={sharedClasses.replace("h-11", "min-h-[120px]")}
                />
            ) : (
                <input
                    type={type}
                    required={required}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={sharedClasses}
                />
            )}
        </div>
    );
}