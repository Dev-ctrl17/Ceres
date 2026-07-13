import React from 'react';
import { MapPin, Star, Mail, Phone } from 'lucide-react';

const AgentProfileCard = ({
  name,
  initials,
  role,
  specialty,
  location,
  status,
  tagline,
  email,
  phone,
}) => {
  return (
    <div className="max-w-[360px] mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center gap-3.5">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-medium text-lg text-blue-700 dark:text-blue-300 flex-shrink-0">
          {initials}
        </div>

        {/* Name/role block */}
        <div className="min-w-0">
          <h3 className="text-[17px] font-medium text-neutral-900 dark:text-white">
            {name}
          </h3>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {role} · {specialty}
          </p>
        </div>
      </div>

      {/* Tag row */}
      <div className="flex gap-2 flex-wrap">
        {/* Location pill */}
        <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center gap-1">
          <MapPin size={13} />
          {location}
        </span>

        {/* Status pill (render only if status is provided) */}
        {status && (
          <span className="text-xs px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
            <Star size={13} />
            {status}
          </span>
        )}
      </div>

      {/* Tagline */}
      <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
        {tagline}
      </p>

      {/* Contact section */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex flex-col gap-2">
        {/* Email row */}
        <a
          href={`mailto:${email}`}
          className="text-[13px] text-neutral-900 dark:text-white no-underline flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Mail size={16} className="text-neutral-400 dark:text-neutral-500" />
          <span>{email}</span>
        </a>

        {/* Phone row */}
        <a
          href={`tel:${phone}`}
          className="text-[13px] text-neutral-900 dark:text-white no-underline flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Phone size={16} className="text-neutral-400 dark:text-neutral-500" />
          <span>{phone}</span>
        </a>
      </div>
    </div>
  );
};

export default AgentProfileCard;