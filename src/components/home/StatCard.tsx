import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

export interface StatCardProps {
    end: number;
    suffix?: string;
    prefix?: string;
    label: string;
    icon: React.ElementType;
    delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ end, suffix = "", prefix = "", label, icon: Icon, delay = 0 }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="relative group"
        >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-brand-orange/30">
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="text-white" size={28} />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-charcoal mb-2">
                        {inView ? (
                            <>
                                {prefix}
                                <CountUp end={end} duration={2.5} separator="," />
                                {suffix}
                            </>
                        ) : (
                            `${prefix}0${suffix}`
                        )}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">{label}</p>
                </div>
            </div>
        </motion.div>
    );
};
