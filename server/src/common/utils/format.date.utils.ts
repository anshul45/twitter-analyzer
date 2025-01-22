export class DateUtil {
  static dateOutput = (dateStr:string):string => {
    const date = new Date(dateStr);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Los_Angeles',      
      weekday: 'short',     
      year: 'numeric',      
      month: 'short',       
      day: 'numeric',       
  };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDate = formatter.format(date);

    return formattedDate.replace(/,/g, '');
};

  static getCurrentDate = (): string => {
    const date = new Date();

    const options = { timeZone: 'America/Los_Angeles' };
    const localizedDate = new Date(date.toLocaleString('en-US', options));

    return localizedDate.toDateString(); 
  };

  static getDatesForLastNDays = (days: number): string[] => {
    const today = new Date();

    const lastNDays = Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - index); 

     
      const options = { timeZone: 'America/Los_Angeles' };
      const localizedDate = new Date(date.toLocaleString('en-US', options));

      return localizedDate.toDateString(); 
    });

    return lastNDays; 
  };

  static getDaysCount = (): number => {
    const startDate = "2025-01-01";
    const timeZone = "America/Los_Angeles";
  
    const start = new Date(new Date(startDate).toLocaleString("en-US", { timeZone }));
  
    const now = new Date();
    const end = new Date(now.toLocaleString("en-US", { timeZone }));
  
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format. Please provide valid dates.");
    }
  
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    return days;
  };
  
}
