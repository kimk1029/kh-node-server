import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Post } from "./Post";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // Definite Assignment Assertion

  @Column({ unique: true })
  username!: string; // Definite Assignment Assertion

  @Column({ unique: true })
  email!: string; // Definite Assignment Assertion

  @Column()
  password!: string; // Definite Assignment Assertion

  @CreateDateColumn()
  created_at!: Date; // Definite Assignment Assertion

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[]; // Definite Assignment Assertion
}
