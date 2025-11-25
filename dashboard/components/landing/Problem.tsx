import { motion } from "framer-motion";
import { TrendingDown, AlertOctagon, DollarSign, Clock, CalendarX, Frown } from "lucide-react";

const stats = [
    {
        icon: AlertOctagon,
        value: "40%",
        label: "Projects with Scope Creep",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
    },
    {
        icon: DollarSign,
        value: "25%",
        label: "Revenue Lost Unbilled",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    },
    {
        icon: Clock,
        value: "20h+",
        label: "Weekly Admin Overhead",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
    },
    {
        icon: CalendarX,
        value: "60%",
        label: "Missed Deadlines",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    }
];

export function ProblemSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        The Hidden Cost of <br /><span className="text-gray-400">Poor Project Management</span>
                    </h2>
                    <p className="text-lg text-gray-400">
                        Traditional tools track tasks, but they don't protect your bottom line.
                        See how much you're leaving on the table.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass-card p-6 rounded-2xl border ${stat.border} hover:-translate-y-1 transition-transform duration-300`}
                        >
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <h3 className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</h3>
                            <p className="text-gray-300 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
