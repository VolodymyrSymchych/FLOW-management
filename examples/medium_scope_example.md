# Project: Internal Employee Directory

## Project Information
- **Name:** Employee Directory Modernization
- **Type:** Internal Web Application
- **Timeline:** 8 weeks
- **Team:** 3 developers, 1 designer

## Objective
Replace the outdated employee directory with a modern web application that makes it easier for employees to find and connect with colleagues.

## Features

### 1. Employee Search
- Search by name, department, location, skills
- Advanced filters
- Results should be fast (no specific time mentioned)
- Display: photo, name, title, department, location, contact info

### 2. Employee Profiles
- Photo, contact information, reporting structure
- Skills and expertise
- Current projects
- Bio section
- Social links (LinkedIn, Twitter)

### 3. Organizational Chart
- Visual org chart
- Interactive and zoomable
- Show reporting relationships
- Export to PDF

### 4. Department Pages
- List of all departments
- Department descriptions
- Team members
- Department contacts

## Technical Details
- Built with React (team is familiar)
- Backend API (Node.js probably)
- Database needed (type TBD)
- Authentication via SSO (we have Okta)

## Data Source
- HR system has employee data
- Need API access or data export
- Update frequency: TBD

## User Access
- Available to all employees (2,500 people)
- Some profiles should be private/limited
- Admin users can edit any profile
- Regular users can edit own profile

## Constraints
- Must work on desktop and mobile
- Must be accessible (WCAG compliance mentioned but not specified)
- Should handle our company size
- No budget specified but "reasonable"

## Success Metrics
- Faster than current system
- Higher usage than old directory
- Positive employee feedback

## Assumptions
- HR data is accurate
- We have access to HR system API
- Employees will update their own profiles
- IT will host the application

## Questions to Resolve
- Who owns profile data accuracy?
- What data is required vs. optional?
- How often does org chart change?
- What are the privacy requirements?
- Who approves profile changes?

## Out of Scope (not explicitly listed)
- Mobile app
- Integration with calendar
- Meeting room booking
- Time-off tracking

## Risks
- HR API might not be available
- Data privacy concerns
- User adoption

