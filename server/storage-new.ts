import { Questionnaire, Reading } from "../shared/schema";

export interface IStorage {
  createQuestionnaire(data: Omit<Questionnaire, "id" | "createdAt">): Promise<Questionnaire>;
  getQuestionnaireById(id: number): Promise<Questionnaire | undefined>;
  createReading(data: Omit<Reading, "id" | "createdAt">): Promise<Reading>;
  getReadingById(id: number): Promise<Reading | undefined>;
}

class MemStorage implements IStorage {
  private questionnaires: Questionnaire[] = [];
  private readings: Reading[] = [];
  private nextQuestionnaireId = 1;
  private nextReadingId = 1;

  async createQuestionnaire(data: Omit<Questionnaire, "id" | "createdAt">): Promise<Questionnaire> {
    const questionnaire: Questionnaire = {
      id: this.nextQuestionnaireId++,
      ...data,
      createdAt: new Date()
    };
    this.questionnaires.push(questionnaire);
    return questionnaire;
  }

  async getQuestionnaireById(id: number): Promise<Questionnaire | undefined> {
    return this.questionnaires.find(q => q.id === id);
  }

  async createReading(data: Omit<Reading, "id" | "createdAt">): Promise<Reading> {
    const reading: Reading = {
      id: this.nextReadingId++,
      ...data,
      createdAt: new Date()
    };
    this.readings.push(reading);
    return reading;
  }

  async getReadingById(id: number): Promise<Reading | undefined> {
    return this.readings.find(r => r.id === id);
  }
}

export const storage = new MemStorage(); 