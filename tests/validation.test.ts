import { 
  emailSchema, 
  phoneSchema, 
  passwordSchema,
  nameSchema,
  bookingSchema 
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin@company.org',
        'firstname+lastname@example.com'
      ]

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow()
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        ''
      ]

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow()
      })
    })
  })

  describe('phoneSchema', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '+250123456789',
        '0123456789',
        '250-123-456-789'
      ]

      validPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).not.toThrow()
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123456789',   // too short
        'abcdefghij',  // not numbers
        '',            // empty
        '123@456.789'  // invalid characters
      ]

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow()
      })
    })
  })

  describe('passwordSchema', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'Password123',
        'StrongPass1',
        'MySecure123',
        'Minimum8Ch1'
      ]

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow()
      })
    })

    it('should reject passwords that are too short', () => {
      const shortPasswords = [
        'Short1',
        '1234567',
        'Abc123'
      ]

      shortPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow()
      })
    })

    it('should reject passwords without required characters', () => {
      const weakPasswords = [
        'alllowercase123',  // no uppercase
        'ALLUPPERCASE123',  // no lowercase
        'NoNumbers',        // no numbers
        ''                  // empty
      ]

      weakPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow()
      })
    })
  })

  describe('nameSchema', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Mary Jane',
        'Al',
        'Jean Baptiste'
      ]

      validNames.forEach(name => {
        expect(() => nameSchema.parse(name)).not.toThrow()
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        'A',              // too short
        'John123',        // contains numbers
        'John@Doe',       // special characters
        '',               // empty
        'A'.repeat(51)    // too long
      ]

      invalidNames.forEach(name => {
        expect(() => nameSchema.parse(name)).toThrow()
      })
    })
  })

  describe('bookingSchema', () => {
    it('should accept valid booking data', () => {
      const validBooking = {
        serviceType: 'cleaning',
        date: '2024-07-25',
        time: '10:00',
        description: 'General house cleaning',
        location: 'Kigali, Rwanda'
      }

      expect(() => bookingSchema.parse(validBooking)).not.toThrow()
    })

    it('should accept booking without optional description', () => {
      const validBooking = {
        serviceType: 'cleaning',
        date: '2024-07-25',
        time: '10:00',
        location: 'Kigali, Rwanda'
      }

      expect(() => bookingSchema.parse(validBooking)).not.toThrow()
    })

    it('should reject booking with missing required fields', () => {
      const invalidBookings = [
        {
          // missing serviceType
          date: '2024-07-25',
          time: '10:00',
          location: 'Kigali, Rwanda'
        },
        {
          serviceType: 'cleaning',
          // missing date
          time: '10:00',
          location: 'Kigali, Rwanda'
        },
        {
          serviceType: 'cleaning',
          date: '2024-07-25',
          // missing time
          location: 'Kigali, Rwanda'
        },
        {
          serviceType: 'cleaning',
          date: '2024-07-25',
          time: '10:00',
          // missing location
        }
      ]

      invalidBookings.forEach(booking => {
        expect(() => bookingSchema.parse(booking)).toThrow()
      })
    })
  })
})
