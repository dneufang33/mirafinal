import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  ScrollText, 
  BarChart3, 
  Settings, 
  Bell, 
  UserCircle, 
  Eye, 
  Edit, 
  Plus,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");

  // Fetch admin data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: questionnairesData, isLoading: questionnairesLoading } = useQuery({
    queryKey: ["/api/admin/questionnaires"],
  });

  const { data: dailyInsightData } = useQuery({
    queryKey: ["/api/daily-insight"],
  });

  const users = usersData?.users || [];
  const stats = statsData || {
    totalUsers: 0,
    monthlyRevenue: 0,
    readingsGenerated: 0,
    subscriptions: 0
  };
  const questionnaires = questionnairesData?.questionnaires || [];

  if (usersLoading || statsLoading) {
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
            <span className="text-yellow-400 font-dancing text-3xl block mb-2">Oracle's</span>
            Sacred Control Chamber
          </h1>
          <p className="text-xl text-white/70">Mystical administration portal for managing the cosmic realm</p>
        </motion.div>

        <Card className="mystical-card rounded-3xl p-8 md:p-12">
          {/* Admin Header */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h3 className="font-playfair text-3xl font-bold mb-2">Oracle Dashboard</h3>
              <p className="text-yellow-400 font-dancing text-lg">
                Managing celestial wisdom • {stats.totalUsers} souls guided
              </p>
            </div>
            <div className="flex space-x-4 mt-6 md:mt-0">
              <Button className="bg-teal-400/20 text-teal-400 px-4 py-2 rounded-full hover:bg-teal-400/30 transition-all duration-300">
                <Bell className="mr-2 w-4 h-4" />
                Notifications
              </Button>
              <Button className="bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-400/30 transition-all duration-300">
                <UserCircle className="mr-2 w-4 h-4" />
                Profile
              </Button>
            </div>
          </motion.div>

          {/* Admin Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="mystical-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.totalUsers}</div>
              <div className="text-white/70 text-sm">Active Souls</div>
            </Card>
            <Card className="mystical-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">${stats.monthlyRevenue}</div>
              <div className="text-white/70 text-sm">Monthly Energy</div>
            </Card>
            <Card className="mystical-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">{stats.readingsGenerated}</div>
              <div className="text-white/70 text-sm">Readings Cast</div>
            </Card>
            <Card className="mystical-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">{stats.subscriptions}</div>
              <div className="text-white/70 text-sm">Sacred Bonds</div>
            </Card>
          </motion.div>

          {/* Admin Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-purple-900/50 mb-8">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-purple-900"
                >
                  <Users className="mr-2 w-4 h-4" />
                  Soul Management
                </TabsTrigger>
                <TabsTrigger 
                  value="content"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-purple-900"
                >
                  <ScrollText className="mr-2 w-4 h-4" />
                  Content Oracle
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-purple-900"
                >
                  <BarChart3 className="mr-2 w-4 h-4" />
                  Cosmic Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-purple-900"
                >
                  <Settings className="mr-2 w-4 h-4" />
                  Realm Settings
                </TabsTrigger>
              </TabsList>

              {/* Users Management */}
              <TabsContent value="users">
                <Card className="mystical-card rounded-2xl p-6">
                  <CardHeader className="flex flex-row items-center justify-between p-0 mb-6">
                    <CardTitle className="font-playfair text-xl font-bold text-yellow-400">
                      Recent Soul Journeys
                    </CardTitle>
                    <Button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                      <Plus className="mr-2 w-4 h-4" />
                      Add Soul
                    </Button>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    {users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-yellow-400/20">
                              <TableHead className="text-yellow-400 font-semibold">Soul</TableHead>
                              <TableHead className="text-yellow-400 font-semibold">Email</TableHead>
                              <TableHead className="text-yellow-400 font-semibold">Journey Status</TableHead>
                              <TableHead className="text-yellow-400 font-semibold">Created</TableHead>
                              <TableHead className="text-yellow-400 font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user: any) => (
                              <TableRow 
                                key={user.id} 
                                className="border-b border-yellow-400/10 hover:bg-yellow-400/5 transition-colors duration-300"
                              >
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-pink-400 flex items-center justify-center">
                                      <span className="text-purple-900 font-bold text-sm">
                                        {user.fullName?.split(' ').map((n: string) => n[0]).join('') || 
                                         user.username?.substring(0, 2).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-semibold">{user.fullName || user.username}</p>
                                      <p className="text-white/60 text-sm">@{user.username}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-white/80">{user.email}</TableCell>
                                <TableCell>
                                  {user.subscriptionStatus ? (
                                    <Badge className="bg-teal-400/20 text-teal-400">
                                      {user.subscriptionStatus}
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-yellow-400/20 text-yellow-400">
                                      Free Soul
                                    </Badge>
                                  )}
                                  {user.isAdmin && (
                                    <Badge className="bg-purple-400/20 text-purple-400 ml-2">
                                      <Crown className="w-3 h-3 mr-1" />
                                      Oracle
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-white/80">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon" className="text-yellow-400 hover:text-orange-400">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-teal-400 hover:text-pink-400">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto w-12 h-12 text-white/40 mb-4" />
                        <p className="text-white/60">No souls have begun their journey yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Management */}
              <TabsContent value="content">
                <div className="space-y-6">
                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400">
                        Daily Cosmic Whispers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label className="text-yellow-400 font-semibold">Today's Whisper</Label>
                          <Textarea
                            className="cosmic-input mt-2"
                            placeholder="Enter today's cosmic message..."
                            defaultValue={dailyInsightData?.insight?.content || ""}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label className="text-yellow-400 font-semibold">Date</Label>
                          <Input
                            type="date"
                            className="cosmic-input mt-2"
                            defaultValue={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <Button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-semibold py-2 px-6 rounded-full">
                          Update Cosmic Whisper
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400">
                        Sacred Questionnaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {questionnaires.length > 0 ? (
                        <div className="space-y-4">
                          {questionnaires.slice(0, 5).map((questionnaire: any) => (
                            <div 
                              key={questionnaire.id} 
                              className="flex items-center justify-between p-4 mystical-card rounded-xl"
                            >
                              <div>
                                <p className="font-semibold">Soul #{questionnaire.userId}</p>
                                <p className="text-white/60 text-sm">
                                  {questionnaire.zodiacSign} • {questionnaire.birthCity}, {questionnaire.birthCountry}
                                </p>
                                <p className="text-white/40 text-xs">
                                  Completed: {new Date(questionnaire.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" className="text-yellow-400">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ScrollText className="mx-auto w-12 h-12 text-white/40 mb-4" />
                          <p className="text-white/60">No questionnaires completed yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400 flex items-center">
                        <TrendingUp className="mr-3 w-5 h-5" />
                        Soul Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-teal-400 mb-2">{stats.totalUsers}</div>
                        <p className="text-white/70">Total Souls Guided</p>
                        <div className="mt-4 h-32 flex items-end justify-center">
                          <div className="text-white/40">📈 Growth visualization would go here</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400 flex items-center">
                        <DollarSign className="mr-3 w-5 h-5" />
                        Cosmic Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-400 mb-2">${stats.monthlyRevenue}</div>
                        <p className="text-white/70">This Moon Cycle</p>
                        <div className="mt-4 h-32 flex items-end justify-center">
                          <div className="text-white/40">💰 Revenue chart would go here</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400 flex items-center">
                        <FileText className="mr-3 w-5 h-5" />
                        Reading Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-pink-400 mb-2">{stats.readingsGenerated}</div>
                        <p className="text-white/70">Readings Generated</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Birth Charts</span>
                            <span className="text-yellow-400">{Math.floor(stats.readingsGenerated * 0.6)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Transit Reports</span>
                            <span className="text-teal-400">{Math.floor(stats.readingsGenerated * 0.3)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Compatibility</span>
                            <span className="text-pink-400">{Math.floor(stats.readingsGenerated * 0.1)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400 flex items-center">
                        <Crown className="mr-3 w-5 h-5" />
                        Sacred Bonds
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-orange-400 mb-2">{stats.subscriptions}</div>
                        <p className="text-white/70">Active Subscriptions</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Lunar Oracle</span>
                            <span className="text-yellow-400">{Math.floor(stats.subscriptions * 0.7)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cosmic Empress</span>
                            <span className="text-purple-400">{Math.floor(stats.subscriptions * 0.3)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400">
                        Realm Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div>
                        <Label className="text-yellow-400 font-semibold">Oracle Name</Label>
                        <Input
                          className="cosmic-input mt-2"
                          defaultValue="Mira Celestial Oracle"
                        />
                      </div>
                      <div>
                        <Label className="text-yellow-400 font-semibold">Welcome Message</Label>
                        <Textarea
                          className="cosmic-input mt-2"
                          defaultValue="Welcome to your cosmic sanctuary..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="text-yellow-400 font-semibold">Default Reading Price</Label>
                        <Input
                          type="number"
                          className="cosmic-input mt-2"
                          defaultValue="89"
                        />
                      </div>
                      <div>
                        <Label className="text-yellow-400 font-semibold">Subscription Price</Label>
                        <Input
                          type="number"
                          className="cosmic-input mt-2"
                          defaultValue="29"
                        />
                      </div>
                      <Button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-semibold py-2 px-6 rounded-full">
                        Save Realm Settings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card rounded-2xl p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="font-playfair text-xl font-bold text-yellow-400">
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <span>New Soul Registrations</span>
                        <Button variant="outline" size="sm" className="border-yellow-400/50 text-yellow-400">
                          Enabled
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment Notifications</span>
                        <Button variant="outline" size="sm" className="border-yellow-400/50 text-yellow-400">
                          Enabled
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Daily Whisper Reminders</span>
                        <Button variant="outline" size="sm" className="border-yellow-400/50 text-yellow-400">
                          Enabled
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
