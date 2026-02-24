// config/constants.js
import dotenv from "dotenv";
dotenv.config();

export const MONGO_DB = {
  connected: "MongoDB Connected",
  connectionError: "MongoDB connection error",
};

export const SERVER = {
  listen: "Server listening on port",
};

export const AUTH = {
  PASSWORD: {
    empty: "Password cannot be empty",
    min: "Password must be at least 6 characters",
    max: "Password cannot exceed 30 characters",
    required: "Password is required",
  },
  EMAIL: {
    empty: "Email cannot be empty",
    email: "Email must be a valid email address",
    required: "Email is required",
  },
  NAME: {
    empty: "Name cannot be empty",
    min: "Name must be at least 2 characters",
    max: "Name cannot exceed 50 characters",
    required: "Name is required",
  },
  CONFIRM_PASSWORD: {
    empty: "Confirm password cannot be empty",
    match: "Passwords must match",
    required: "Confirm password is required",
  },
};
export const PROFILE = {
  // Bio validation messages
  BIO: {
    empty: "Bio cannot be empty. Please provide a bio or remove the field.",
    min: "Bio must be at least {#limit} characters long.",
    max: "Bio cannot exceed {#limit} characters.",
    required: "Bio is required.",
    invalid: "Bio must be a valid string.",
  },

  // URL validation messages
  URL: {
    empty:
      "URL cannot be empty. Please provide a valid URL or remove the field.",
    uri: "Please enter a valid URL (e.g., https://example.com).",
    scheme: "URL must start with http:// or https://.",
    max: "URL cannot exceed {#limit} characters.",
    invalid: "Invalid URL format.",
  },

  // Address validation messages
  ADDRESS: {
    empty:
      "Address cannot be empty. Please provide an address or remove the field.",
    min: "Address must be at least {#limit} characters long.",
    max: "Address cannot exceed {#limit} characters.",
    required: "Address is required.",
    invalid: "Address must be a valid string.",
  },

  // Phone validation messages
  PHONE: {
    empty:
      "Phone number cannot be empty. Please provide a phone number or remove the field.",
    pattern:
      "Please enter a valid phone number (only digits, spaces, dashes, parentheses, and + sign allowed).",
    min: "Phone number must be at least {#limit} digits.",
    max: "Phone number cannot exceed {#limit} characters.",
    invalid: "Invalid phone number format.",
    required: "Phone number is required.",
  },

  // Avatar validation messages
  AVATAR: {
    empty:
      "Avatar URL cannot be empty. Please provide an avatar URL or remove the field.",
    uri: "Please enter a valid avatar URL.",
    max: "Avatar URL cannot exceed {#limit} characters.",
    invalid: "Invalid avatar URL.",
    allowed_extension:
      "Avatar must be a valid image URL (jpg, jpeg, png, gif, webp).",
    size: "Avatar URL is too long.",
  },

  // Country validation messages
  COUNTRY: {
    empty:
      "Country cannot be empty. Please select a country or remove the field.",
    length: "Country code must be exactly 2 letters (e.g., US, IN, GB).",
    max: "Country name cannot exceed {#limit} characters.",
    invalid: "Please select a valid country.",
    required: "Country is required.",
    allowed_values:
      "Please select a country from the list of supported countries.",
  },

  GENERAL: {
    update_success: "Profile updated successfully.",
    update_failed: "Failed to update profile. Please try again.",
    fetch_success: "Profile retrieved successfully.",
    fetch_failed: "Failed to fetch profile.",
    not_found: "Profile not found.",
    unauthorized: "You are not authorized to update this profile.",
    validation_error: "Profile validation failed.",
    avatar_upload_success: "Avatar uploaded successfully.",
    avatar_upload_failed: "Failed to upload avatar.",
    avatar_removed: "Avatar removed successfully.",
    invalid_file_type: "Invalid file type. Allowed types: {types}.",
    file_too_large: "File is too large. Maximum size: {size}MB.",
  },
};
export const RESPONSE_MESSAGES = {
  email_registered_already: "Email is already registered",
  user_registered: "User registered successfully",
  server_error: "Something went wrong on the server",
  login_success: "Login successful",
  invalid_credentials: "Invalid email or password",
  reset_link_sent:
    "We’ve sent a password reset link to your email. Please check your inbox.",
  // OTP messages
  otp_sent: "OTP has been sent to your email",
  otp_verified: "OTP verified successfully",
  invalid_otp: "Invalid OTP",
  otp_expired: "OTP has expired",
};

export const SECURITY = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRE,
};
export const PROGRAM = {
  // General validation messages
  validation: {
    information: {
      name: {
        required: "Program name is required",
        min: "Program name must be at least 2 characters",
        max: "Program name cannot exceed 100 characters",
        empty: "Program name cannot be empty",
      },
      id: {
        required: "Program ID is required",
        unique: "Program ID must be unique",
        pattern:
          "Program ID can only contain uppercase letters, numbers, hyphens and underscores",
        max: "Program ID cannot exceed 50 characters",
        empty: "Program ID cannot be empty",
      },
      degree_awarded: {
        required: "Degree awarded is required",
        min: "Degree awarded must be at least 2 characters",
        max: "Degree awarded cannot exceed 100 characters",
        empty: "Degree awarded cannot be empty",
      },
      program_type: {
        required: "Program type is required",
        min_items: "At least one program type is required",
        max_items: "Maximum 5 program types allowed",
        invalid:
          "Invalid program type. Allowed: full time, half time, part time, online, hybrid",
      },
      status: {
        invalid: "Invalid status. Allowed: active, inactive, draft, archived",
      },
    },
    faculty: {
      faculty: {
        required: "Faculty name is required",
        min: "Faculty name must be at least 2 characters",
        max: "Faculty name cannot exceed 150 characters",
        empty: "Faculty name cannot be empty",
      },
      department: {
        required: "Department name is required",
        min: "Department name must be at least 2 characters",
        max: "Department name cannot exceed 150 characters",
        empty: "Department name cannot be empty",
      },
    },
    duration: {
      years: {
        min: "Years cannot be negative",
        max: "Years cannot exceed 10",
      },
      months: {
        min: "Months cannot be negative",
        max: "Months cannot exceed 11",
      },
      semester: {
        min: "Semester must be at least 1",
        max: "Semester cannot exceed 12",
      },
      credit_required: {
        required: "Credit hours are required",
        min: "Credit hours must be at least 1",
        max: "Credit hours cannot exceed 200",
      },
      weekly_commitment: {
        max: "Weekly commitment cannot exceed 50 characters",
      },
    },
    fees: {
      tuition: {
        required: "Tuition fee is required",
        min: "Tuition fee cannot be negative",
      },
      currency: {
        required: "Currency is required",
        invalid: "Invalid currency. Allowed: USD, EUR, GBP, INR, PKR, CAD, AUD",
      },
      payment_schedule: {
        invalid:
          "Invalid payment schedule. Allowed: monthly, quarterly, semester, yearly, one-time",
      },
      additional: {
        application_fee: {
          min: "Application fee cannot be negative",
        },
        health_insurance: {
          min: "Health insurance fee cannot be negative",
        },
        other_fees: {
          min: "Other fees cannot be negative",
        },
      },
    },
    intakes: {
      intake: {
        required: "Intake name is required",
        empty: "Intake name cannot be empty",
      },
      deadline: {
        required: "Deadline is required",
        invalid: "Invalid deadline date",
      },
      status: {
        invalid:
          "Invalid intake status. Allowed: upcoming, ongoing, closed, completed",
      },
      seats: {
        min: "Seats cannot be negative",
      },
    },
    details: {
      description: {
        required: "Program description is required",
        min: "Description must be at least 50 characters",
        max: "Description cannot exceed 5000 characters",
      },
      sections: {
        heading: {
          required: "Section heading is required",
          max: "Section heading cannot exceed 200 characters",
          empty: "Section heading cannot be empty",
        },
        description: {
          required: "Section description is required",
          min: "Section description must be at least 10 characters",
          max: "Section description cannot exceed 2000 characters",
          empty: "Section description cannot be empty",
        },
        order: {
          min: "Section order must be at least 1",
        },
      },
    },
  },

  // Controller messages
  messages: {
    id_exists: "Program ID already exists",
    invalid_status:
      "Invalid status value. Allowed: active, inactive, draft, archived",
    no_intakes: "No active intakes found for this program",

    create_success: "Program created successfully",
    update_success: "Program updated successfully",
    delete_success: "Program deleted successfully",
    fetch_success: "Program retrieved successfully",
    fetch_all_success: "Programs retrieved successfully",
    status_update_success: "Program status updated successfully",
    intakes_fetch_success: "Program intakes retrieved successfully",

    create_failed: "Failed to create program",
    update_failed: "Failed to update program",
    delete_failed: "Failed to delete program",
    fetch_failed: "Failed to retrieve program",
    fetch_all_failed: "Failed to retrieve programs",
    status_update_failed: "Failed to update program status",
    intakes_fetch_failed: "Failed to retrieve program intakes",
  },

  // General messages
  general: {
    not_found: "Program not found",
    unauthorized: "You are not authorized to perform this action",
    validation_error: "Program validation failed",
    create_success: "Program created successfully",
    create_failed: "Failed to create program",
    update_success: "Program updated successfully",
    update_failed: "Failed to update program",
    delete_success: "Program deleted successfully",
    delete_failed: "Failed to delete program",
    fetch_success: "Program retrieved successfully",
    fetch_failed: "Failed to retrieve program",
    fetch_all_success: "Programs retrieved successfully",
    fetch_all_failed: "Failed to retrieve programs",
    server_error: "Internal server error",
  },

  // Filter/sort options
  filters: {
    status_options: ["active", "inactive", "draft", "archived"],
    program_type_options: [
      "full time",
      "half time",
      "part time",
      "online",
      "hybrid",
    ],
    payment_schedule_options: [
      "monthly",
      "quarterly",
      "semester",
      "yearly",
      "one-time",
    ],
    currency_options: ["USD", "EUR", "GBP", "INR", "PKR", "CAD", "AUD"],
    sort_options: [
      "createdAt",
      "updatedAt",
      "information.name",
      "fees.tuition",
    ],
  },

  // Limits
  limits: {
    name_min: 2,
    name_max: 100,
    id_max: 50,
    degree_min: 2,
    degree_max: 100,
    faculty_min: 2,
    faculty_max: 150,
    department_min: 2,
    department_max: 150,
    description_min: 50,
    description_max: 5000,
    section_heading_max: 200,
    section_description_min: 10,
    section_description_max: 2000,
    years_max: 10,
    months_max: 11,
    semester_max: 12,
    credit_min: 1,
    credit_max: 200,
    weekly_commitment_max: 50,
    program_type_min: 1,
    program_type_max: 5,
  },
};

export const FACULTY = {
  validation: {
    name: {
      required: "Faculty name is required",
      empty: "Faculty name cannot be empty",
      min: "Faculty name must be at least 2 characters",
      max: "Faculty name cannot exceed 150 characters",
      unique: "Faculty name already exists",
    },
    code: {
      required: "Faculty code is required",
      empty: "Faculty code cannot be empty",
      max: "Faculty code cannot exceed 20 characters",
      pattern:
        "Faculty code can only contain uppercase letters, numbers, and hyphens",
      unique: "Faculty code already exists",
    },
    description: {
      max: "Description cannot exceed 1000 characters",
    },
    contact_email: {
      email: "Please enter a valid email address",
    },
    website: {
      uri: "Please enter a valid website URL",
    },
  },

  messages: {
    create_success: "Faculty created successfully",
    update_success: "Faculty updated successfully",
    delete_success: "Faculty deleted successfully",
    fetch_success: "Faculty retrieved successfully",
    fetch_all_success: "Faculties retrieved successfully",

    create_failed: "Failed to create faculty",
    update_failed: "Failed to update faculty",
    delete_failed: "Failed to delete faculty",
    fetch_failed: "Failed to retrieve faculty",
    fetch_all_failed: "Failed to retrieve faculties",

    not_found: "Faculty not found",
    code_exists: "Faculty code already exists",
    name_exists: "Faculty name already exists",
  },

  limits: {
    name_min: 2,
    name_max: 150,
    code_max: 20,
    description_max: 1000,
  },
};
