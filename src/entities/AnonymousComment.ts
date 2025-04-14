import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { AnonymousPost } from "./AnonymousPost";

@Entity()
export class AnonymousComment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  content!: string;

  @Column()
  password!: string;

  @ManyToOne(() => AnonymousPost, post => post.comments)
  post!: AnonymousPost;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  anonymousNickname!: string;

  @Column()
  ipAddress!: string;

  @ManyToOne(() => AnonymousComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parent_id" })
  parent!: AnonymousComment | null;

  @OneToMany(() => AnonymousComment, (comment) => comment.parent)
  replies!: AnonymousComment[];
} 