const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara_tetangga';

// 1. REGISTER USER
const register = async (req, res) => {
  try {
    const { username, email, password, roleName } = req.body; // roleName: 'ADMIN', 'EDITOR', atau 'USER'

    // Cek apakah email sudah terdaftar
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'Email sudah terdaftar' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cari role di database berdasarkan nama role yang dikirim
    const role = await prisma.role.findUnique({ where: { name: roleName || 'USER' } });

    // Simpan user ke database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roleId: role.id // Menghubungkan user dengan role-nya
      }
    });

    res.status(201).json({ message: 'User berhasil registrasi!', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN USER (Generate JWT Token)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user beserta rolenya dan permission-nya
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Password salah' });

    // Ambil semua nama permission untuk dimasukkan ke dalam token (berguna untuk middleware Atha)
    const permissions = user.role.rolePermissions.map(rp => rp.permission.name);

    // Generate JWT Token (Bawa id, role, dan permissions)
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role.name,
        permissions: permissions 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login };