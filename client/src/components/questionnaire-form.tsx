import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Globe, User, Heart, Target, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const questionnaireSchema = z.object({
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().min(1, "Birth time is required"),
  birthCity: z.string().min(1, "Birth city is required"),
  birthCountry: z.string().min(1, "Birth country is required"),
  zodiacSign: z.string().min(1, "Zodiac sign is required"),
  personalityTraits: z.array(z.string()).min(1, "Please select at least one personality trait"),
  spiritualGoals: z.string().min(10, "Please describe your spiritual goals"),
  relationshipHistory: z.string().min(10, "Please describe your relationship patterns"),
  lifeIntentions: z.string().min(10, "Please describe your life intentions"),
  specificQuestions: z.string().optional(),
});

const QuestionnaireForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<z.infer<typeof questionnaireSchema>>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      birthDate: "",
      birthTime: "",
      birthCity: "",
      birthCountry: "",
      zodiacSign: "",
      personalityTraits: [],
      spiritualGoals: "",
      relationshipHistory: "",
      lifeIntentions: "",
      specificQuestions: "",
    },
  });

  const submitQuestionnaire = useMutation({
    mutationFn: (data: z.infer<typeof questionnaireSchema>) =>
      apiRequest("POST", "/api/questionnaire", data),
    onSuccess: () => {
      toast({
        title: "Sacred Questionnaire Complete!",
        description: "Your cosmic blueprint has been created. Redirecting to your dashboard...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire"] });
      setTimeout(() => setLocation("/dashboard"), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Cosmic Interference",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof questionnaireSchema>) => {
    submitQuestionnaire.mutate(values);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const personalityTraits = [
    "Intuitive", "Analytical", "Creative", "Empathetic", "Ambitious", "Spiritual",
    "Independent", "Nurturing", "Adventurous", "Intellectual", "Emotional", "Practical"
  ];

  const countries = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" }, 
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "it", label: "Italy" },
    { value: "es", label: "Spain" },
    { value: "other", label: "Other" }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="font-playfair text-4xl font-bold mb-4 text-yellow-400">
                Your Celestial Birth Details
              </h3>
              <p className="text-white/70 text-lg">
                The cosmic symphony began the moment you entered this realm. 
                Share your sacred birth information to map your celestial blueprint.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                        <Calendar className="mr-2 w-5 h-5" />
                        Birth Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="cosmic-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                        <Clock className="mr-2 w-5 h-5" />
                        Birth Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          className="cosmic-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="birthCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                        <MapPin className="mr-2 w-5 h-5" />
                        Birth City
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="cosmic-input"
                          placeholder="Where did your journey begin?"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                        <Globe className="mr-2 w-5 h-5" />
                        Country
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="cosmic-input">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="mystical-card border-yellow-400/20">
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="font-playfair text-4xl font-bold mb-4 text-yellow-400">
                Your Zodiac Sign
              </h3>
              <p className="text-white/70 text-lg">
                What celestial constellation guides your cosmic essence?
              </p>
            </div>

            <FormField
              control={form.control}
              name="zodiacSign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-yellow-400 font-semibold mb-6 flex items-center justify-center">
                    <User className="mr-2 w-5 h-5" />
                    Select Your Zodiac Sign
                  </FormLabel>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {zodiacSigns.map((sign) => (
                      <motion.button
                        key={sign}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => field.onChange(sign)}
                        className={`mystical-card p-4 rounded-xl text-center transition-all duration-300 ${
                          field.value === sign
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'hover:border-yellow-400/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">♈</div>
                        <div className="text-sm font-semibold">{sign}</div>
                      </motion.button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="font-playfair text-4xl font-bold mb-4 text-yellow-400">
                Your Sacred Traits
              </h3>
              <p className="text-white/70 text-lg">
                Which mystical qualities resonate most deeply with your soul?
              </p>
            </div>

            <FormField
              control={form.control}
              name="personalityTraits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-yellow-400 font-semibold mb-6 text-center">
                    Select all traits that describe you
                  </FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {personalityTraits.map((trait) => (
                      <motion.button
                        key={trait}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const current = field.value || [];
                          const updated = current.includes(trait)
                            ? current.filter(t => t !== trait)
                            : [...current, trait];
                          field.onChange(updated);
                        }}
                        className={`mystical-card p-4 rounded-xl text-center transition-all duration-300 ${
                          field.value?.includes(trait)
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'hover:border-yellow-400/50'
                        }`}
                      >
                        <div className="text-sm font-semibold">{trait}</div>
                      </motion.button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="font-playfair text-4xl font-bold mb-4 text-yellow-400">
                Your Spiritual Journey
              </h3>
              <p className="text-white/70 text-lg">
                What sacred goals guide your path toward enlightenment?
              </p>
            </div>

            <FormField
              control={form.control}
              name="spiritualGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                    <Target className="mr-2 w-5 h-5" />
                    Describe Your Spiritual Goals
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="cosmic-input min-h-32"
                      placeholder="Share your deepest spiritual aspirations and what you seek to achieve on your sacred journey..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="font-playfair text-4xl font-bold mb-4 text-yellow-400">
                Relationships & Love
              </h3>
              <p className="text-white/70 text-lg">
                How have the threads of connection woven through your life story?
              </p>
            </div>

            <FormField
              control={form.control}
              name="relationshipHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                    <Heart className="mr-2 w-5 h-5" />
                    Your Relationship Patterns
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="cosmic-input min-h-32"
                      placeholder="Describe your relationship history, patterns, and lessons learned through love and connection..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="font-playfair text-4xl font-bold mb-4 text-yellow-400">
                Life Intentions
              </h3>
              <p className="text-white/70 text-lg">
                What sacred intentions will guide your path forward?
              </p>
            </div>

            <FormField
              control={form.control}
              name="lifeIntentions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                    <Target className="mr-2 w-5 h-5" />
                    Your Life Intentions
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="cosmic-input min-h-32"
                      placeholder="Share your intentions for the future, what you wish to manifest, and how you want to grow..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key="step7"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="font-playfair text-4xl font-bold mb-4 text-yellow-400">
                Final Sacred Questions
              </h3>
              <p className="text-white/70 text-lg">
                Any specific cosmic questions or areas you'd like guidance on?
              </p>
            </div>

            <FormField
              control={form.control}
              name="specificQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-yellow-400 font-semibold mb-3 flex items-center">
                    <HelpCircle className="mr-2 w-5 h-5" />
                    Specific Questions (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="cosmic-input min-h-32"
                      placeholder="Ask the cosmos anything specific you'd like guidance on..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-5xl font-bold mb-6">
            <span className="text-yellow-400 font-dancing text-3xl block mb-2">Sacred</span>
            Questionnaire Journey
          </h2>
          <p className="text-xl text-white/70">Seven mystical steps to unlock your cosmic blueprint</p>
        </div>

        <Card className="mystical-card rounded-3xl p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Progress Indicator */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex space-x-4">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <motion.div
                      key={i + 1}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        i + 1 <= currentStep
                          ? 'bg-yellow-400 text-purple-900'
                          : 'border-2 border-yellow-400/30 text-yellow-400/50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
                <span className="text-yellow-400 font-dancing font-semibold">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-12">
                <Progress value={progress} className="h-2 bg-purple-900/50" />
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-12">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="text-yellow-400 hover:text-pink-400 transition-colors duration-300 flex items-center"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 font-semibold py-3 px-8 rounded-full hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 flex items-center"
                  >
                    Continue Journey
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitQuestionnaire.isPending}
                    className="bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 font-semibold py-3 px-8 rounded-full hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
                  >
                    {submitQuestionnaire.isPending
                      ? "Creating Your Cosmic Blueprint..."
                      : "Complete Sacred Journey"
                    }
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default QuestionnaireForm;
