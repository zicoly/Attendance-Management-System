const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  textColor,
}: any) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className={`text-xs ${textColor} mt-1`}>
          <Icon className="w-3 h-3 inline mr-1" />
          {subtitle}
        </p>
      </div>
      <div className={`${gradient} p-3 rounded-full`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);
export default StatsCard;
