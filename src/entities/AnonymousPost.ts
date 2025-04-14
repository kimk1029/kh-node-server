import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";

@Entity()
export class AnonymousPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ default: 0 })
  views!: number;

  @Column()
  anonymousNickname!: string;

  @Column()
  password!: string; // 게시글 수정/삭제를 위한 비밀번호

  @Column()
  ipAddress!: string;

  @OneToMany("AnonymousComment", "post", { cascade: true })
  comments!: any[];

  @OneToMany("AnonymousLike", "post")
  likes!: any[];
} 