package ����ѧ;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class Regis {
   public static void main(String[] args)
   {

 	   if(args.length!=4)
 		   System.out.println("�����ʵ���Ŀ�Ĳ���");
 	   int mark=0;
 	   String  username;
 	   String userpwd;
 	   String publickey;
 	   String privatekey;
 	   username=args[0];
 	   userpwd=args[1];
 	   publickey=args[2];
 	   privatekey=args[3];
 	   try {
	        Class.forName("com.mysql.jdbc.Driver");     //����MYSQL JDBC��������   
	        //Class.forName("org.gjt.mm.mysql.Driver");
	       System.out.println("Success loading Mysql Driver!");
	      }
	      catch (Exception e) {
	        System.out.print("Error loading Mysql Driver!");
	        e.printStackTrace();
	      }
 	   
	      try {
	        Connection connect = DriverManager.getConnection(
	            "jdbc:mysql://localhost:3306/test","  "," ");
	             //����URLΪ   jdbc:mysql//��������ַ/���ݿ���  �������2�������ֱ��ǵ�½�û���������

	        System.out.println("Success connect Mysql server!");
	        
	        PreparedStatement statement=connect.prepareStatement("INSERT INTO ���� VALUES(?,?,?,?)");
	        statement.setString(1, username);
	        statement.setString(2, userpwd);
            statement.setString(3, publickey);
            statement.setString(4, privatekey);
     }catch (SQLException e) {
		// TODO: handle exception
    	 e.printStackTrace();
	}
  }
}
