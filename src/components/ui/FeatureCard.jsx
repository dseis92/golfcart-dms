export default function FeatureCard({ icon: Icon, title, subtitle, right, children }) {
  return (
    <div className="card p-5">
      <div className="card-row">
        <div className="row-left">
          <div className="feature-icon">{Icon ? <Icon className="h-5 w-5" /> : null}</div>
          <div>
            <div className="font-medium">{title}</div>
            {subtitle ? <div className="text-sm text-zinc-500">{subtitle}</div> : null}
          </div>
        </div>
        {right}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}
