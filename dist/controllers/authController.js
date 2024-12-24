"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const typeorm_1 = require("typeorm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../entities/User");
const generateToken_1 = __importDefault(require("../utils/generateToken"));
// 회원가입 컨트롤러
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const { username, email, password } = req.body;
        // 필수 필드 확인
        if (!username || !email || !password) {
            res.status(400).json({ message: "Please provide all required fields" });
            return;
        }
        // 사용자 중복 확인
        const existingUser = yield userRepository.findOne({
            where: [{ username }, { email }],
        });
        if (existingUser) {
            res.status(400).json({ message: "Username or email already exists" });
            return;
        }
        // 비밀번호 해싱
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // 사용자 생성
        const user = userRepository.create({
            username,
            email,
            password: hashedPassword,
        });
        yield userRepository.save(user);
        // JWT 토큰 생성
        const token = (0, generateToken_1.default)(user);
        res.status(201).json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.register = register;
// 로그인 컨트롤러
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const { email, password } = req.body;
        // 필수 필드 확인
        if (!email || !password) {
            res.status(400).json({ message: "Please provide email and password" });
            return;
        }
        // 사용자 조회
        const user = yield userRepository.findOne({ where: { email } });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        // 비밀번호 비교
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        // JWT 토큰 생성
        const token = (0, generateToken_1.default)(user);
        res.status(200).json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.login = login;
