import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleCode } from '@apulse/shared';

import { User } from './entities/user.entity.js';
import { Role } from '../role/entities/role.entity.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createRegisteredUser(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    saltPass: string;
  }): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const customerRole = await this.roleRepository.findOneBy({
      code: RoleCode.CUSTOMER,
    });

    if (!customerRole) {
      throw new InternalServerErrorException(
        'The default customer role is not configured',
      );
    }

    const user = this.userRepository.create({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      password: input.password,
      saltPass: input.saltPass,
      roleId: customerRole.id,
    });

    return this.userRepository.save(user);
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        saltPass: true,
        roleId: true,
        deletedAt: true,
      },
    });
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roleId: true,
        role: {
          id: true,
          code: true,
          permissions: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      relations: {
        role: {
          permissions: true,
        },
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }
}
