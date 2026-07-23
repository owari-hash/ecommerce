import ServiceBento from '../components/ServiceBento'

interface ServiceBentoSectionProps {
  title?: string
}

export default function ServiceBentoSection({ title = 'Үйлчилгээ' }: ServiceBentoSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">{title}</h2>
      <ServiceBento />
    </div>
  )
}
