const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"],
        // trim: true,
        // maxLength: [40, "A tour must have less or equal to 40 characters"],
        // minLength: [10, "A tour must have more or equal to 10 characters"],
        // validate: [validator.isAlpha,"A tour name must only contain characters"]
    },
    email: {
        type: String,
        required: [true, "A user must have a emailID"],
        unique: true,
        lowercase:true,
        validate:[validator.isEmail,"Please enter a valid email address"]
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide","admin"],
        default:"user"
    },
    photo: {
        type: String,
        default:"default.jpg"
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minLength:[8, "A password must have more or equal to 8 characters"],
        unique: true,
        select: false
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: "A user must have same password as before"
        },
        required:[true,"Please Confirm your password"]
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select:false
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
          this.passwordChangedAt.getTime() / 1000
        );
        return JWTTimestamp < changedTimestamp;
    }
};

userSchema.methods.changedPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + (10 * 60 * 1000); // adding 10 minutes
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;