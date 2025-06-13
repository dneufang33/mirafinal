import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Feather, RotateCcw, History, Plus, Settings, Download, Share, Calendar, Star, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const DashboardContent = () => {
  const { user } = useAuth();

  const { data: readingsData, isLoading: readingsLoading } = useQuery({
    queryKey: ["/api/readings"],
    enabled: !!user,
  });

  const { data: dailyInsight } = useQuery({
    queryKey: ["/api/daily-insight"],
  });

  const readings = readingsData?.readings || [];
  const insight = dailyInsight?.insight;

  if (readingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-playfair text-5xl font-bold mb-6">
            <span className="text-yellow-400 font-dancing text-3xl block mb-2">Your Personal</span>
            Celestial Sanctuary
          </h1>
          <p className="text-xl text-white/70">Your mystical dashboard awaits with cosmic insights and sacred wisdom</p>
        </motion.div>

        <Card className="mystical-card rounded-3xl p-8 md:p-12">
          {/* Dashboard Header */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-pink-400 flex items-center justify-center">
                <span className="text-purple-900 font-bold text-xl">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || user?.username?.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-playfair text-2xl font-bold">{user?.fullName || user?.username}</h3>
                <p className="text-yellow-400 font-dancing text-lg">Cosmic Soul • Sacred Journey Begun</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button className="bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-400/30 transition-all duration-300">
                <Download className="mr-2 w-4 h-4" />
                Download Reading
              </Button>
              <Button className="bg-teal-400/20 text-teal-400 px-4 py-2 rounded-full hover:bg-teal-400/30 transition-all duration-300">
                <Share className="mr-2 w-4 h-4" />
                Share
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Today's Whisper */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="mystical-card rounded-2xl p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="font-playfair text-xl font-bold text-yellow-400 flex items-center">
                      <Feather className="mr-3 w-5 h-5" />
                      Today's Cosmic Whisper
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-white/80 leading-relaxed mb-4">
                      {insight?.content || "The universe speaks in whispers to those who listen with their hearts. Today, Venus dances through your house of dreams, awakening forgotten wishes and ancient promises your soul made to itself long ago."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-yellow-400/20">
                      <span className="text-yellow-400/70 text-sm">
                        {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex space-x-2">
                        <Moon className="text-teal-400 w-5 h-5" />
                        <Star className="text-yellow-400 w-5 h-5" />
                        <Sun className="text-orange-400 w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Birth Chart Display */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="mystical-card rounded-2xl p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="font-playfair text-xl font-bold text-yellow-400 flex items-center">
                      <RotateCcw className="mr-3 w-5 h-5" />
                      Your Sacred Birth Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                        alt="Detailed astrological birth chart with zodiac symbols" 
                        className="rounded-xl w-full h-64 object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent rounded-xl"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400 font-semibold">Interactive Chart</span>
                          <Button variant="ghost" size="icon" className="text-white hover:text-yellow-400">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Current Transits */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Card className="mystical-card rounded-2xl p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="font-playfair text-lg font-bold text-yellow-400 flex items-center">
                      <RotateCcw className="mr-3 w-4 h-4" />
                      Active Transits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">Mars ♂ Sextile Venus</p>
                          <p className="text-white/60 text-xs">Nov 12 - 18</p>
                        </div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">Jupiter ♃ Trine Moon</p>
                          <p className="text-white/60 text-xs">Nov 10 - 20</p>
                        </div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">Mercury ☿ Square Saturn</p>
                          <p className="text-white/60 text-xs">Nov 15 - 17</p>
                        </div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reading History */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <Card className="mystical-card rounded-2xl p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="font-playfair text-lg font-bold text-yellow-400 flex items-center">
                      <History className="mr-3 w-4 h-4" />
                      Sacred Archive
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      {readings.length > 0 ? (
                        readings.slice(0, 3).map((reading: any) => (
                          <div key={reading.id} className="flex items-center justify-between py-2 border-b border-yellow-400/10 last:border-b-0">
                            <div>
                              <p className="font-semibold text-sm">{reading.title}</p>
                              <p className="text-white/60 text-xs">
                                {new Date(reading.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-yellow-400/50 hover:text-yellow-400">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-white/60 text-sm">No readings yet</p>
                          <p className="text-white/40 text-xs">Complete the questionnaire to get your first reading</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300">
                  <Plus className="mr-2 w-4 h-4" />
                  New Reading
                </Button>
                <Button className="w-full border border-teal-400 text-teal-400 font-semibold py-3 px-4 rounded-xl hover:bg-teal-400/10 transition-all duration-300">
                  <Settings className="mr-2 w-4 h-4" />
                  Settings
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
