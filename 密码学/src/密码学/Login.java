package 密码学;

import java.sql.*;
public class Login {
    public static void main(String[] args)
    {
    	
 	   if(args.length!=2)
 		   System.out.println("传递适当数目的参数");
 	   String  username;
 	   String userpwd;
 	   String publickey = null;
 	   String privatekey = null;
 	   username=args[0];
 	   userpwd=args[1]; 
 	   int mark=0; 
 	   try {
	        Class.forName("com.mysql.jdbc.Driver");     //加载MYSQL JDBC驱动程序   
	        //Class.forName("org.gjt.mm.mysql.Driver");
	       System.out.println("Success loading Mysql Driver!");
	      }
	      catch (Exception e) {
	        System.out.print("Error loading Mysql Driver!");
	        e.printStackTrace();
	      }
	      try {
	        Connection connect = DriverManager.getConnection(
	            "jdbc:mysql://localhost:3306/数据库名","  "," ");
	             //连接URL为   jdbc:mysql//服务器地址/数据库名  ，后面的2个参数分别是登陆用户名和密码

	        System.out.println("Success connect Mysql server!");
	        //建立Statement对象
	        Statement stmt = connect.createStatement();
	        //建立PreparedStatement对象
	        String sql="select * from 表名 wherw userName=? ";
	        PreparedStatement pStatement=connect.prepareStatement(sql);
	        pStatement.setString(1, username);
	        ResultSet rs = stmt.executeQuery(sql);  //user 为表的名称
	        mark=0;   //标记查询结果
	       if(rs.next())
	       {
	    	 String tmppwd;
	    	 tmppwd=rs.getString(2);
	    	
	    	 System.out.println("用户名为： "+username);
	    	 if(tmppwd==userpwd)
	    	 {
	    	     mark=1;
	    	     publickey=rs.getString(3);
	    	     privatekey=rs.getString(4);
	    	 }
	    	 else {
	    		 System.out.println("用户密码不正确");
	    	 }
	       }
	      }catch (Exception e) {
			// TODO: handle exception
	    	  e.printStackTrace();
		}
	      
	  //按照要求输出json数据 用户名，是否匹配，公钥，私钥
	      
	      System.out.print("{"+"\"用户名\""+":"+"\""+username+"\"");
	      System.out.print(","+"\"匹配\""+":"+"\""+mark+"\"");
	      System.out.print(","+"\"公钥\""+":"+"\""+publickey+"\"");
	      System.out.print(","+"\"私钥\""+":"+"\""+privatekey+"\""+"}");
    }
}
