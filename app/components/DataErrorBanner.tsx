export default function DataErrorBanner() {
  return (
    <div className="bg-red-600 text-white text-center py-4 px-6 font-sans">
      <p className="font-semibold text-base">We&apos;re experiencing technical difficulties</p>
      <p className="text-sm mt-1 text-red-100">
        Some data couldn&apos;t be loaded right now. Parts of the site may not display correctly.
      </p>
    </div>
  )
}
