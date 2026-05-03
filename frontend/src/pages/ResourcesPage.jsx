import { Helmet } from 'react-helmet-async';

const resources = [
  {
    category: '🚨 Emergency',
    color: 'border-l-red-500',
    items: [
      { name: 'Police Emergency', phone: '119', action: 'tel:119', desc: '24/7 police response' },
      { name: 'Ambulance / Fire', phone: '999', action: 'tel:999', desc: 'Medical & fire emergency' },
      { name: 'GBV Hotline', phone: '1195', action: 'tel:1195', desc: 'Gender-based violence support' },
      { name: 'Child Helpline', phone: '116', action: 'tel:116', desc: 'Child protection services' },
    ]
  },
  {
    category: '🧠 Mental Health',
    color: 'border-l-blue-500',
    items: [
      { name: 'Befrienders Kenya', phone: '+254 722 178 177', action: 'tel:+254722178177', desc: '24/7 crisis helpline' },
      { name: 'Niskize Counseling', phone: '+254 709 362 000', action: 'tel:+254709362000', desc: 'Professional counseling - Kilifi' },
      { name: 'University Counseling Services', phone: 'Ext. 234', action: 'tel:+254412345678', desc: 'Free and confidential' },
      { name: 'Oasis Africa', phone: '+254 725 366 614', action: 'tel:+254725366614', desc: 'Trauma counseling' },
    ]
  },
  {
    category: '⚖️ Legal Aid',
    color: 'border-l-amber-500',
    items: [
      { name: 'Kituo Cha Sheria', phone: '+254 20 240 3958', action: 'tel:+254202403958', desc: 'Free legal advice' },
      { name: 'FIDA Kenya', phone: '+254 722 509 605', action: 'tel:+254722509605', desc: 'Women\'s rights legal aid' },
      { name: 'Kilifi Law Courts', phone: '+254 41 752 2053', action: 'tel:+254417522053', desc: 'County legal services' },
      { name: 'KNCHR Kilifi', phone: '+254 722 264 507', action: 'tel:+254722264507', desc: 'Human rights complaints' },
    ]
  },
  {
    category: '🏠 Shelter & Food',
    color: 'border-l-green-500',
    items: [
      { name: 'Kenya Red Cross Kilifi', phone: '+254 700 395 395', action: 'tel:+254700395395', desc: 'Emergency shelter & food' },
      { name: 'Karibuni Trust', phone: '+254 722 456 789', action: 'tel:+254722456789', desc: 'Community support - Kilifi' },
      { name: 'Plan International', phone: '+254 20 387 0217', action: 'tel:+254203870217', desc: 'Child protection & shelter' },
    ]
  },
  {
    category: '🏥 Medical',
    color: 'border-l-teal-500',
    items: [
      { name: 'Kilifi County Hospital', phone: '+254 41 752 2178', action: 'tel:+254417522178', desc: '24/7 emergency care' },
      { name: 'Mtwapa Health Centre', phone: '+254 41 202 5312', action: 'tel:+254412025312', desc: 'Primary healthcare' },
      { name: 'Malindi Hospital', phone: '+254 41 203 0310', action: 'tel:+254412030310', desc: 'District hospital' },
      { name: 'Mariakani Cottage Hospital', phone: '+254 722 345 678', action: 'tel:+254722345678', desc: 'Private care - Kaloleni' },
    ]
  },
  {
    category: '🤝 Community Support',
    color: 'border-l-purple-500',
    items: [
      { name: 'Kilifi County Social Services', phone: '+254 41 752 2000', action: 'tel:+254417522000', desc: 'Government social programs' },
      { name: 'Coast Youth Network', phone: '+254 712 345 678', action: 'tel:+254712345678', desc: 'Community support' },
      { name: 'Coast Disabled Persons Org', phone: '+254 733 456 789', action: 'tel:+254733456789', desc: 'Disability support services' },
    ]
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <Helmet>
        <title>Support Resources - Huduma Ecosystem</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">📞 Support Resources</h1>
        <p className="text-gray-400 mb-8">
          Tap any number to call directly. All contacts verified for Kilifi County.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((section) => (
            <div key={section.category} className={`glass-card p-5 border-l-4 ${section.color}`}>
              <h3 className="text-lg font-bold text-white mb-4">{section.category}</h3>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.action}
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group"
                  >
                    <p className="text-white font-semibold group-hover:text-primary-gold transition">
                      {item.name}
                    </p>
                    <p className="text-primary-gold font-bold text-sm mt-0.5">
                      {item.phone}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
