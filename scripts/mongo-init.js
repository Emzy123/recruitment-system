// MongoDB initialization script
// This runs when the container first starts

db = db.getSiblingDB('recruitment_db');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.positions.createIndex({ isActive: 1 });
db.positions.createIndex({ department: 1 });
db.positions.createIndex({ postedDate: -1 });

db.applications.createIndex({ candidateId: 1 });
db.applications.createIndex({ positionId: 1 });
db.applications.createIndex({ status: 1 });
db.applications.createIndex({ submittedAt: -1 });

db.assessmenttemplates.createIndex({ positionId: 1 });
db.assessmenttemplates.createIndex({ isActive: 1 });

db.assessmentinvitations.createIndex({ candidateId: 1 });
db.assessmentinvitations.createIndex({ applicationId: 1 });
db.assessmentinvitations.createIndex({ status: 1 });

db.assessmentresults.createIndex({ invitationId: 1 });
db.assessmentresults.createIndex({ candidateId: 1 });

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });

db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully');
