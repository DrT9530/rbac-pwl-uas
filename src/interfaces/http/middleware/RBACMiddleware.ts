import { db } from "../../../infrastructure/database/prisma-client";

export const requirePermission = (requiredPermission: string) => {
  return async (req: any, res: any, next: any) => {
    // Simulasi ambil userId dari token/sesi
    const userId = req.user?.id; 
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Ambil User + relasi Role & Permission sekaligus
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      // Evaluasi izin akses
      const hasPermission = user.roles.some((userRole) => 
        userRole.role.permissions.some((rp) => rp.permission.name === requiredPermission)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: "Forbidden: Akses ditolak" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: "Server Error" });
    }
  };
};