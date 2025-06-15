import { type Questionnaire, type Reading } from "../shared/schema";

export interface IStorage {
  // Questionnaire methods
  createQuestionnaire(data: Omit<Questionnaire, "id" | "createdAt">): Promise<Questionnaire>;
  getQuestionnaireById(id: number): Promise<Questionnaire | undefined>;
  getAllQuestionnaires(): Promise<Questionnaire[]>;

  // Reading methods
  createReading(data: Omit<Reading, "id" | "createdAt">): Promise<Reading>;
  getReadingById(id: number): Promise<Reading | undefined>;
  getReadingsByQuestionnaireId(questionnaireId: number): Promise<Reading[]>;
  getAllReadings(): Promise<Reading[]>;
}

export class MemStorage implements IStorage {
  private questionnaires: Questionnaire[] = [];
  private readings: Reading[] = [];

  // Questionnaire methods
  async createQuestionnaire(data: Omit<Questionnaire, "id" | "createdAt">): Promise<Questionnaire> {
    const questionnaire: Questionnaire = {
      ...data,
      id: Date.now(),
      createdAt: new Date()
    };
    this.questionnaires.push(questionnaire);
    return questionnaire;
  }

  async getQuestionnaireById(id: number): Promise<Questionnaire | undefined> {
    return this.questionnaires.find(q => q.id === id);
  }

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    return [...this.questionnaires];
  }

  // Reading methods
  async createReading(data: Omit<Reading, "id" | "createdAt">): Promise<Reading> {
    const reading: Reading = {
      ...data,
      id: Date.now(),
      createdAt: new Date()
    };
    this.readings.push(reading);
    return reading;
  }

  async getReadingById(id: number): Promise<Reading | undefined> {
    return this.readings.find(r => r.id === id);
  }

  async getReadingsByQuestionnaireId(questionnaireId: number): Promise<Reading[]> {
    return this.readings.filter(r => r.questionnaireId === questionnaireId);
  }

  async getAllReadings(): Promise<Reading[]> {
    return [...this.readings];
  }
}

export const storage = new MemStorage(); 