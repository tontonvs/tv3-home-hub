import { Clock } from "lucide-react";

interface NewsCardProps {
  image: string;
  category: string;
  title: string;
  time: string;
  featured?: boolean;
}

const NewsCard = ({ image, category, title, time, featured }: NewsCardProps) => {
  if (featured) {
    return (
      <article className="relative rounded-xl overflow-hidden group cursor-pointer">
        <img src={image} alt={title} className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-primary text-xs font-bold uppercase tracking-wider">{category}</span>
          <h3 className="font-display text-base font-bold text-foreground mt-1 leading-snug line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-3 p-3 rounded-xl bg-card hover:bg-secondary cursor-pointer transition-colors group">
      <img
        src={image}
        alt={title}
        className="w-24 h-20 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
      />
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-primary text-[10px] font-bold uppercase tracking-wider">{category}</span>
        <h3 className="font-display text-sm font-semibold text-foreground mt-0.5 leading-snug line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-[10px] mt-1.5">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
