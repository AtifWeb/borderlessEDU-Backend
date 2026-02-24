export class Helper {
  static _formatProgramResponse(program) {
    return {
      id: program._id,
      university: {
        name: program.university.name,
        location: program.university.location,
        website: program.university.website,
        ranking: program.university.ranking,
      },
      information: {
        name: program.information.name,
        id: program.information.id,
        degree_awarded: program.information.degree_awarded,
        program_type: program.information.program_type,
        status: program.information.status,
        created_by: program.information.created_by,
      },
      faculty: {
        faculty: program.faculty.faculty,
        department: program.faculty.department,
        faculty_id: program.faculty.faculty_id,
        department_id: program.faculty.department_id,
      },
      duration: {
        years: program.duration.years,
        months: program.duration.months,
        semester: program.duration.semester,
        credit_required: program.duration.credit_required,
        weekly_commitment: program.duration.weekly_commitment,
        total_months: program.duration.total_months,
      },
      fees: {
        tuition: program.fees.tuition,
        currency: program.fees.currency,
        scholarship_available: program.fees.scholarship_available,
        payment_schedule: program.fees.payment_schedule,
        additional: program.fees.additional,
        total: program.fees.total,
      },
      intakes: program.intakes,
      details: {
        description: program.details.description,
        sections: program.details.sections,
        prerequisites: program.details.prerequisites,
        learning_outcomes: program.details.learning_outcomes,
        career_opportunities: program.details.career_opportunities,
      },
      accreditation: program.accreditation,
      ranking: program.ranking,
      tags: program.tags,
      is_featured: program.is_featured,
      created_at: program.createdAt,
      updated_at: program.updatedAt,
    };
  }
}
