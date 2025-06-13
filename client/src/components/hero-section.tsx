import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Moon, Eye, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="nebula-bg absolute inset-0"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="font-playfair text-6xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="block text-yellow-400 font-dancing text-4xl md:text-5xl mb-4">Welcome to the</span>
            Celestial Oracle
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Unlock the mysteries of your cosmic blueprint through personalized astrological insights, 
            ancient wisdom, and celestial guidance tailored to your unique spiritual journey.
          </motion.p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Mystical celestial mandala with golden symbols" 
                className="rounded-2xl shadow-2xl animate-cosmic-spin w-full h-96 object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-transparent rounded-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="mystical-card rounded-2xl p-8">
              <CardContent className="p-0">
                <h3 className="font-playfair text-3xl font-bold mb-6 text-yellow-400">Begin Your Reading</h3>
                <p className="text-white/70 mb-8">
                  Answer our mystical questionnaire to receive your personalized cosmic blueprint, 
                  complete with planetary alignments and spiritual guidance.
                </p>
                <Link href="/questionnaire">
                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 font-semibold py-4 px-8 rounded-full hover:shadow-xl hover:shadow-yellow-400/40 transition-all duration-500 transform hover:scale-105">
                    <WandSparkles className="mr-3 w-5 h-5" />
                    Start Sacred Questionnaire
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-3 gap-4">
              <motion.div 
                className="mystical-card rounded-xl p-4 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="text-yellow-400 text-2xl mb-2 mx-auto" />
                <p className="text-sm font-semibold">Birth Chart</p>
              </motion.div>
              <motion.div 
                className="mystical-card rounded-xl p-4 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Moon className="text-teal-400 text-2xl mb-2 mx-auto" />
                <p className="text-sm font-semibold">Moon Phase</p>
              </motion.div>
              <motion.div 
                className="mystical-card rounded-xl p-4 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="text-pink-400 text-2xl mb-2 mx-auto" />
                <p className="text-sm font-semibold">Intuitive</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
