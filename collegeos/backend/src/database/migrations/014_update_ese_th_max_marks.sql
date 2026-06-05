-- Scale down obtained marks for ESE-TH if they were recorded out of 100
UPDATE grades 
SET obtained_marks = LEAST(obtained_marks * 0.4, 40)
WHERE component_id IN (
  SELECT id FROM grade_components WHERE component_name = 'ESE-TH' AND max_marks = 100
);

-- Update the max_marks for all ESE-TH components to 40
UPDATE grade_components 
SET max_marks = 40 
WHERE component_name = 'ESE-TH';
