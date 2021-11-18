import{
    Column,
    Entity,
    PrimaryColumn,
} from 'typeorm';

@Entity()
export default class UserEntity {
    @PrimaryColumn()
    public username!: string;
    
    @Column()
    public password!: string;
    
    @Column()
    public role!: string;
    
    @Column()
    public walletID!: string;
    
    @Column()
    public skipWallet!: boolean;

}