import { Component } from '@angular/core';

interface CalibrationOption {
   label: string;
   next: string;
   points: number;
   stamp: string;
}

interface CalibrationQuestion {
   id: string;
   chapter: string;
   prompt: string;
   options: CalibrationOption[];
}

interface CalibrationEnding {
   title: string;
   code: string;
   description: string;
   advice: string;
}

@Component({
   standalone: false,
   selector: 'app-calibration',
   templateUrl: './calibration.component.html',
   styleUrls: ['./calibration.component.css']
})
export class CalibrationComponent {
   private readonly questions: Record<string, CalibrationQuestion> = {
      start: {
         id: 'start', chapter: 'INTAKE / 01',
         prompt: 'A recruiter asks what you are looking for. The room loses one degree of temperature. What do you hand them?',
         options: [
            { label: 'A one-page CV with the useful bits highlighted.', next: 'craft', points: 3, stamp: 'EVIDENCE' },
            { label: 'A beautifully formatted manifesto about possibility.', next: 'signal', points: 1, stamp: 'VIBES' },
            { label: 'A small, calm silence. It has excellent posture.', next: 'wildcard', points: 2, stamp: 'MYSTERY' }
         ]
      },
      craft: {
         id: 'craft', chapter: 'INTAKE / 02A',
         prompt: 'Your strongest skill is difficult to explain without sounding like a tutorial. What is the honest move?',
         options: [
            { label: 'Describe the problem, your contribution, and the result.', next: 'finish', points: 3, stamp: 'CLARITY' },
            { label: 'Name twelve tools and hope one of them blinks.', next: 'finish', points: 0, stamp: 'TOOLBELT' }
         ]
      },
      signal: {
         id: 'signal', chapter: 'INTAKE / 02B',
         prompt: 'The signal is strong but the job description contains the phrase “self-starter.” How do you proceed?',
         options: [
            { label: 'Ask what success looks like after ninety days.', next: 'finish', points: 3, stamp: 'QUESTIONS' },
            { label: 'Start three side projects before lunch.', next: 'finish', points: 1, stamp: 'CHAOS' }
         ]
      },
      wildcard: {
         id: 'wildcard', chapter: 'INTAKE / 02C',
         prompt: 'The silence begins to hum. It asks whether your work has ever changed someone’s Tuesday.',
         options: [
            { label: 'Yes. Tell the small story and leave the myth outside.', next: 'finish', points: 3, stamp: 'IMPACT' },
            { label: 'No, but the dashboard has gradients.', next: 'finish', points: 0, stamp: 'GRADIENTS' }
         ]
      }
   };

   private readonly endings: CalibrationEnding[] = [
      { title: 'THE PRACTICAL ORBIT', code: 'END-A / 07', description: 'You believe a career is a sequence of useful bets, made visible with enough evidence to survive contact with another human.', advice: 'Keep the CV concrete. Let the work carry one extra sentence.' },
      { title: 'THE BEAUTIFUL DETOUR', code: 'END-B / 13', description: 'You are not lost. You are collecting unusual angles until the map becomes an instrument rather than a verdict.', advice: 'Pair the strange idea with one measurable result. The universe respects receipts.' },
      { title: 'THE UNDOCUMENTED SIGNAL', code: 'END-C / 21', description: 'You have a route, but it is currently written in invisible ink. Someone will need a flashlight: a project, a story, a finished thing.', advice: 'Make one piece of work easy to point at. Mystery is a seasoning, not a database field.' },
      { title: 'THE CALM ANOMALY', code: 'END-D / 34', description: 'The system cannot classify you without becoming less accurate. This is flattering, but not yet a strategy.', advice: 'Choose a direction for the next experiment. You can change it later; that is allowed.' }
   ];

   current: CalibrationQuestion = this.questions['start'];
   route: string[] = [];
   score = 0;
   ending: CalibrationEnding | null = null;
   saved = false;

   choose(option: CalibrationOption): void {
      this.route = [...this.route, option.stamp];
      this.score += option.points;
      if (option.next === 'finish') {
         this.ending = this.resolveEnding();
         return;
      }
      this.current = this.questions[option.next];
   }

   reset(): void {
      this.current = this.questions['start'];
      this.route = [];
      this.score = 0;
      this.ending = null;
      this.saved = false;
   }

   saveResult(): void {
      if (!this.ending) return;
      const historyKey = 'jms-calibration-history';
      const history = JSON.parse(localStorage.getItem(historyKey) ?? '[]') as unknown[];
      history.unshift({ code: this.ending.code, title: this.ending.title, route: this.route, savedAt: new Date().toISOString() });
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 8)));
      this.saved = true;
   }

   private resolveEnding(): CalibrationEnding {
      const routeBias = this.route.includes('MYSTERY') ? 1 : 0;
      const index = Math.min(this.endings.length - 1, Math.floor((this.score + routeBias) / 2));
      return this.endings[index];
   }
}
