using SocketIOClient;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace frontend_app
{
    public partial class Form1 : Form
    {
        public delegate void UpdateLabelMethod(string text, bool isLabel1);
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            Debug.WriteLine("clicked");
            socketIoManager();
        }

        private async void socketIoManager()
        {
            var client = new SocketIO("http://localhost:8888/");
            Debug.WriteLine("past socket initalization");

            client.OnConnected += async (sender, e) =>
            {
                Debug.WriteLine("ühendatud");
                UpdateStatus("ühendatud", false);
            };

            client.On("hello", (data) =>
            {
                Debug.WriteLine(data.GetValue<string>());
                UpdateStatus(data.GetValue<string>(), true);
            });

            await client.ConnectAsync();
        }

        private void UpdateStatus(string text, bool isLabel1)
        {
            if (isLabel1 ? this.label1.InvokeRequired : this.label2.InvokeRequired)
            {
                UpdateLabelMethod del = new UpdateLabelMethod(UpdateStatus);
                this.Invoke(del, new object[] { text, isLabel1 });
            }
            else
            {
                if (isLabel1)
                {
                    this.label1.Text = text;
                } else
                {
                    this.label2.Text = text;
                }
            }
        }
    }
}
