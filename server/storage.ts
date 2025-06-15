import { 
  users, questionnaires, readings, payments, dailyInsights,
  type User, type InsertUser, 
  type Questionnaire, type InsertQuestionnaire,
  type Reading, type InsertReading,
  type Payment, type InsertPayment,
  type DailyInsight, type InsertDailyInsight
} from "@shared/schema";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  isAdmin: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserSubscriptionStatus(userId: number, status: string): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Questionnaire methods
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;
  getQuestionnaireByUserId(userId: number): Promise<Questionnaire | undefined>;
  getAllQuestionnaires(): Promise<Questionnaire[]>;

  // Reading methods
  createReading(reading: InsertReading): Promise<Reading>;
  getReadingsByUserId(userId: number): Promise<Reading[]>;
  getReadingById(id: number): Promise<Reading | undefined>;
  getAllReadings(): Promise<Reading[]>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;

  // Daily Insights methods
  createDailyInsight(insight: InsertDailyInsight): Promise<DailyInsight>;
  getDailyInsightByDate(date: string): Promise<DailyInsight | undefined>;
  getAllDailyInsights(): Promise<DailyInsight[]>;
  updateDailyInsight(id: number, insight: Partial<DailyInsight>): Promise<DailyInsight>;

  // Reset methods
  updateUserResetToken(userId: number, resetToken: string, resetTokenExpiry: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  clearUserResetToken(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questionnaires: Map<number, Questionnaire>;
  private readings: Map<number, Reading>;
  private payments: Map<number, Payment>;
  private dailyInsights: Map<number, DailyInsight>;
  private currentUserId: number;
  private currentQuestionnaireId: number;
  private currentReadingId: number;
  private currentPaymentId: number;
  private currentInsightId: number;

  constructor() {
    this.users = new Map();
    this.questionnaires = new Map();
    this.readings = new Map();
    this.payments = new Map();
    this.dailyInsights = new Map();
    this.currentUserId = 1;
    this.currentQuestionnaireId = 1;
    this.currentReadingId = 1;
    this.currentPaymentId = 1;
    this.currentInsightId = 1;

    // Create admin user
    this.createUser({
      username: "admin",
      email: "admin@mira.com",
      password: "admin123",
      fullName: "Mira Oracle Admin"
    }).then(user => {
      this.users.set(user.id, { ...user, isAdmin: true });
    });

    // Create sample daily insights
    this.initializeDailyInsights();
  }

  private async initializeDailyInsights() {
    const today = new Date().toISOString().split('T')[0];
    await this.createDailyInsight({
      title: "Today's Cosmic Whisper",
      content: "The universe speaks in whispers to those who listen with their hearts. Today, Venus dances through your house of dreams, awakening forgotten wishes and ancient promises your soul made to itself long ago.",
      date: today,
      zodiacSign: null,
      isActive: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      isAdmin: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId, stripeSubscriptionId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserSubscriptionStatus(userId: number, status: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, subscriptionStatus: status };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Questionnaire methods
  async createQuestionnaire(insertQuestionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const id = this.currentQuestionnaireId++;
    const questionnaire: Questionnaire = {
      ...insertQuestionnaire,
      id,
      completedAt: new Date()
    };
    this.questionnaires.set(id, questionnaire);
    return questionnaire;
  }

  async getQuestionnaireByUserId(userId: number): Promise<Questionnaire | undefined> {
    return Array.from(this.questionnaires.values()).find(q => q.userId === userId);
  }

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    return Array.from(this.questionnaires.values());
  }

  // Reading methods
  async createReading(insertReading: InsertReading): Promise<Reading> {
    const id = this.currentReadingId++;
    const reading: Reading = {
      ...insertReading,
      id,
      createdAt: new Date()
    };
    this.readings.set(id, reading);
    return reading;
  }

  async getReadingsByUserId(userId: number): Promise<Reading[]> {
    return Array.from(this.readings.values()).filter(r => r.userId === userId);
  }

  async getReadingById(id: number): Promise<Reading | undefined> {
    return this.readings.get(id);
  }

  async getAllReadings(): Promise<Reading[]> {
    return Array.from(this.readings.values());
  }

  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.userId === userId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  // Daily Insights methods
  async createDailyInsight(insertInsight: InsertDailyInsight): Promise<DailyInsight> {
    const id = this.currentInsightId++;
    const insight: DailyInsight = {
      ...insertInsight,
      id,
      createdAt: new Date()
    };
    this.dailyInsights.set(id, insight);
    return insight;
  }

  async getDailyInsightByDate(date: string): Promise<DailyInsight | undefined> {
    return Array.from(this.dailyInsights.values()).find(i => i.date === date && i.isActive);
  }

  async getAllDailyInsights(): Promise<DailyInsight[]> {
    return Array.from(this.dailyInsights.values());
  }

  async updateDailyInsight(id: number, updates: Partial<DailyInsight>): Promise<DailyInsight> {
    const insight = this.dailyInsights.get(id);
    if (!insight) throw new Error("Daily insight not found");
    
    const updatedInsight = { ...insight, ...updates };
    this.dailyInsights.set(id, updatedInsight);
    return updatedInsight;
  }

  // Reset methods
  async updateUserResetToken(userId: number, resetToken: string, resetTokenExpiry: Date): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    this.users.set(userId, {
      ...user,
      resetToken,
      resetTokenExpiry,
    });
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.resetToken === token && user.resetTokenExpiry && user.resetTokenExpiry > new Date()
    );
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    this.users.set(userId, {
      ...user,
      password: hashedPassword,
    });
  }

  async clearUserResetToken(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    this.users.set(userId, {
      ...user,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }
}

export const storage = new MemStorage();
