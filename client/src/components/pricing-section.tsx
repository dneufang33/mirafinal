import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Moon, Crown, ScrollText, Calendar, Heart, Download, Infinity, Bell, WandSparkles, ChartLine, Gem, Video, Users, Phone } from "lucide-react";
import { motion } from "framer-motion";

const PricingSection = () => {
  const pricingPlans = [
    {
      name: "Sacred Reading",
      price: 89,
      type: "one-time",
      description: "One-time cosmic revelation",
      icon: ScrollText,
      features: [
        "Complete Birth Chart Analysis",
        "12-Month Forecast",
        "Love & Relationship Insights",
        "Downloadable PDF Report"
      ],
      buttonText: "Begin Sacred Reading",
      buttonVariant: "outline" as const,
      href: "/checkout?plan=sacred"
    },
    {
      name: "Lunar Oracle",
      price: 29,
      type: "monthly",
      description: "Monthly cosmic wisdom",
      icon: Moon,
      popular: true,
      features: [
        "Everything in Sacred Reading",
        "Daily Whispers & Insights",
        "Monthly Ritual Suggestions",
        "Real-time Transit Updates"
      ],
      buttonText: "Start Lunar Journey",
      buttonVariant: "default" as const,
      href: "/subscribe?plan=lunar"
    },
    {
      name: "Cosmic Empress",
      price: 89,
      type: "monthly",
      description: "Ultimate spiritual guidance",
      icon: Crown,
      features: [
        "Everything in Lunar Oracle",
        "Weekly Video Readings",
        "Access to Sacred Circle",
        "Priority Oracle Support"
      ],
      buttonText: "Ascend to Empress",
      buttonVariant: "outline" as const,
      href: "/subscribe?plan=empress"
    }
  ];

  const getIconMap = (IconComponent: any) => {
    const iconMap: Record<string, any> = {
      "Complete Birth Chart Analysis": Star,
      "12-Month Forecast": Calendar,
      "Love & Relationship Insights": Heart,
      "Downloadable PDF Report": Download,
      "Everything in Sacred Reading": Infinity,
      "Daily Whispers & Insights": Bell,
      "Monthly Ritual Suggestions": WandSparkles,
      "Real-time Transit Updates": ChartLine,
      "Everything in Lunar Oracle": Gem,
      "Weekly Video Readings": Video,
      "Access to Sacred Circle": Users,
      "Priority Oracle Support": Phone
    };
    return iconMap;
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-playfair text-5xl font-bold mb-6">
            <span className="text-yellow-400 font-dancing text-3xl block mb-2">Choose Your</span>
            Cosmic Gateway
          </h2>
          <p className="text-xl text-white/70">Select the mystical journey that resonates with your soul</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            const iconMap = getIconMap(IconComponent);
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Card className={`mystical-card rounded-2xl p-8 transform transition-all duration-500 h-full ${
                  plan.popular ? 'border-2 border-yellow-400' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-purple-900 px-6 py-2 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="text-center mb-8">
                      <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${
                        plan.popular 
                          ? 'from-yellow-400 to-orange-400 animate-pulse-glow' 
                          : index === 0 
                            ? 'from-teal-400 to-pink-400'
                            : 'from-pink-400 to-teal-400'
                      } rounded-full flex items-center justify-center mb-6`}>
                        <IconComponent className="text-purple-900 text-2xl" />
                      </div>
                      <h3 className="font-playfair text-2xl font-bold mb-4">{plan.name}</h3>
                      <div className="text-4xl font-bold text-yellow-400 mb-2">
                        ${plan.price}
                        {plan.type === 'monthly' && <span className="text-lg">/month</span>}
                      </div>
                      <p className="text-white/60">{plan.description}</p>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => {
                        const FeatureIcon = iconMap[feature] || Check;
                        return (
                          <motion.li 
                            key={feature}
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <FeatureIcon className="text-yellow-400 mr-3 w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </motion.li>
                        );
                      })}
                    </ul>
                    
                    <Link href={plan.href}>
                      <Button 
                        variant={plan.buttonVariant}
                        className={`w-full font-semibold py-3 px-6 rounded-full transition-all duration-300 ${
                          plan.buttonVariant === 'default'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 hover:shadow-xl hover:shadow-yellow-400/40'
                            : plan.name === 'Sacred Reading'
                              ? 'border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-purple-900'
                              : 'border-2 border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-purple-900'
                        }`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
