type AdminStatCardProps = {
  icon: string;
  color: "blue" | "green" | "purple" | "orange" | "yellow" | "red";
  title: string;
  value: string;
  trend?: string;
  trendType?: "positive" | "negative";
  comparison?: string;
};

function AdminStatCard({ icon, color, title, value, trend, trendType = "positive", comparison }: AdminStatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${color}`}><svg><use href={`#${icon}`} /></svg></div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {trend && <small className={trendType}>{trend} {comparison && <span>{comparison}</span>}</small>}
      </div>
    </article>
  );
}

export default AdminStatCard;
